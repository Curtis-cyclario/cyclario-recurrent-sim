
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Lattice3D, MetricsData, UserPattern, GlobalSettings, PhysicsModel } from '../types';
import { SIZE, DEPTH, DEFAULT_CORE_GRID, INTRA_MODULE_WEIGHT, INTER_MODULE_WEIGHT, INTERCONNECT_WEIGHT, INTERCONNECT_CHANNELS } from '../constants';
import { DEFAULT_PATTERNS } from '../patterns';

const STORAGE_KEY = 'recurrent-automaton-patterns';

// --- Utility Functions ---
const deepCopyLattice = (lattice: Lattice3D): Lattice3D => {
    const size = lattice.length;
    const res = new Array(size);
    for (let i = 0; i < size; i++) {
        const row = lattice[i];
        const newRow = new Array(size);
        for (let j = 0; j < size; j++) {
            newRow[j] = [...row[j]];
        }
        res[i] = newRow;
    }
    return res;
};

const deepCopyInterconnects = (interconnects: { rows: boolean[]; cols: boolean[]; }) => ({
    rows: [...interconnects.rows],
    cols: [...interconnects.cols],
});

// Optimized Metric Calculation: Combines XOR, Swastika Transform, and Counting in one pass without allocations
const calculateMetrics = (
    currentLattice: Lattice3D,
    prevLattice: Lattice3D,
    startTime: number,
    totalCells: number,
    thermalLoadRef: React.MutableRefObject<number>
): MetricsData => {
    let deltaCount = 0;
    let activeCells = 0;
    const depth = currentLattice[0][0].length;

    // Helper to get source coordinates for the Swastika Transform (Rotation mapping)
    // Maps destination (i, j) back to source (srcI, srcJ) before rotation
    const getSourceIndices = (i: number, j: number): [number, number] => {
        // Center cross (row 4 or col 4) and Middle Module (3-5, 3-5) are identity mapped
        if (i === 4 || j === 4 || (i >= 3 && i <= 5 && j >= 3 && j <= 5)) {
            return [i, j];
        }

        // Determine which corner module we are in
        const startI = Math.floor(i / 3) * 3;
        const startJ = Math.floor(j / 3) * 3;
        
        // Relative coordinates within the module
        // We want to map the destination (rotated) back to the source (unrotated)
        // The transform applied was: dest(local_i, local_j) = src(2-local_j, local_i)
        // Inverse: src(local_i, local_j) = dest(local_j, 2-local_i)
        
        const localI = i - startI;
        const localJ = j - startJ;

        // Inverse 90 degree rotation
        const srcLocalI = localJ;
        const srcLocalJ = 2 - localI;

        return [startI + srcLocalI, startJ + srcLocalJ];
    };

    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const [srcI, srcJ] = getSourceIndices(i, j);
            
            for (let k = 0; k < depth; k++) {
                const cellVal = currentLattice[i][j][k];
                if (cellVal === 1) activeCells++;

                // Calculate Diff at Source indices
                const srcVal = currentLattice[srcI][srcJ][k];
                const prevSrcVal = prevLattice[srcI][srcJ][k];
                const diff = srcVal ^ prevSrcVal;

                if (diff === 1) {
                    deltaCount++;
                }
            }
        }
    }

    const endTime = performance.now();
    const latency = endTime - startTime;
    const delta_swastika = Math.sqrt(deltaCount);
    const energy = totalCells > 0 ? activeCells / totalCells : 0;
    
    // Update thermal load
    const newThermalLoad = thermalLoadRef.current * 0.95 + energy * 0.05;
    thermalLoadRef.current = newThermalLoad;

    return { delta_swastika, latency, energy, thermalLoad: newThermalLoad };
};


// --- Gate Logic Helpers ---
const applyXORRule = (sum: number): 0 | 1 => (sum > 0 && sum % 2 !== 0) ? 1 : 0;
const applyThresholdRule = (sum: number): 0 | 1 => (sum >= 2) ? 1 : 0;
const applyMemoryRule = (sum: number, current: number): 0 | 1 => {
    if (current === 0) return sum === 1 ? 1 : 0;
    return sum > 1 ? 0 : 1;
};
const applyNOTRule = (sum: number): 0 | 1 => (sum === 0) ? 1 : 0;

const mapToCoreIndex = (idx: number): number => {
  if (idx >= 3 && idx <= 5) return idx - 3;
  if (idx < 3) return 2 - idx;
  return 8 - idx;
};

const generateMirroredFace = (core: number[][]): number[][] => {
  const face = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      face[i][j] = core[mapToCoreIndex(i)][mapToCoreIndex(j)];
    }
  }
  return face;
};

const createEmptyLattice = (depth: number): Lattice3D => {
    const lat = new Array(SIZE);
    for(let i=0; i<SIZE; i++) {
        const row = new Array(SIZE);
        for(let j=0; j<SIZE; j++) {
            row[j] = new Array(depth).fill(0);
        }
        lat[i] = row;
    }
    return lat;
};

const generateDefaultLattice = (depth: number): Lattice3D => {
  const lattice = createEmptyLattice(depth);
  const midLayer = Math.floor(depth / 2);
  // Default centered pattern
  lattice[4][4][midLayer] = 1;
  const r = 1, c = 1;
  lattice[r][c][midLayer] = 1;
  lattice[r][SIZE - 1 - c][midLayer] = 1;
  lattice[SIZE - 1 - r][c][midLayer] = 1;
  lattice[SIZE - 1 - r][SIZE - 1 - c][midLayer] = 1;
  return lattice;
};

const defaultInterconnects = { rows: [false, false, false], cols: [false, false, false] };

const WAVE_MOMENTUM = 0.5;

export const useSimulation = ({ globalSettings, physicsModel }: { globalSettings: GlobalSettings, physicsModel: PhysicsModel }) => {
    const depth = DEPTH;
    const totalCells = SIZE * SIZE * depth;

    const [coreGrid, setCoreGrid] = useState<number[][]>(DEFAULT_CORE_GRID);
    const [kernelFace, setKernelFace] = useState<number[][]>(() => generateMirroredFace(DEFAULT_CORE_GRID));
    const [lattice, setLattice] = useState<Lattice3D>(() => generateDefaultLattice(depth));
    const [prevLattice, setPrevLattice] = useState<Lattice3D>(() => createEmptyLattice(depth));
    const [running, setRunning] = useState<boolean>(false);
    const [metrics, setMetrics] = useState<MetricsData>({ delta_swastika: 0, latency: 0, energy: 0, thermalLoad: 0 });
    const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
    const [delay, setDelay] = useState<number>(200);
    const [effectiveDelay, setEffectiveDelay] = useState<number>(delay);
    const [patterns, setPatterns] = useState<UserPattern[]>([]);
    const [selectedPatternId, setSelectedPatternId] = useState<string>('default-start');
    const [showBorders, setShowBorders] = useState<boolean>(true);
    const [interconnects, setInterconnects] = useState(defaultInterconnects);
    
    // Playback and Recording State
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPlaybackMode, setIsPlaybackMode] = useState<boolean>(false);
    const [simulationHistory, setSimulationHistory] = useState<{ lattice: Lattice3D; prevLattice: Lattice3D; metrics: MetricsData; }[]>([]);
    const [playbackIndex, setPlaybackIndex] = useState<number>(0);

    const intervalRef = useRef<number | null>(null);
    const thermalLoadRef = useRef<number>(0);

    useEffect(() => {
        try {
            const savedPatternsJSON = localStorage.getItem(STORAGE_KEY);
            const savedUserPatterns = savedPatternsJSON ? JSON.parse(savedPatternsJSON) : [];
            setPatterns([...DEFAULT_PATTERNS, ...savedUserPatterns]);
        } catch (error) {
            console.error("Failed to load patterns from localStorage:", error);
            setPatterns(DEFAULT_PATTERNS);
        }
    }, []);

    useEffect(() => {
        try {
            const userPatterns = patterns.filter(p => !p.isDefault);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userPatterns));
        } catch (error) {
            console.error("Failed to save patterns to localStorage:", error);
        }
    }, [patterns]);

    useEffect(() => {
        setKernelFace(generateMirroredFace(coreGrid));
    }, [coreGrid]);
    
    const stepLattice = useCallback(() => {
        const startTime = performance.now();
        const newLattice: Lattice3D = createEmptyLattice(depth); 
        
        // Cache active channels to avoid re-iterating inside inner loops
        const activeRows = new Int8Array(SIZE);
        const activeCols = new Int8Array(SIZE);
        const activeInterconnects = interconnects.rows.some(v=>v) || interconnects.cols.some(v=>v);
        
        if (activeInterconnects) {
            for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) for (let d = 0; d < depth; d++) {
                if (lattice[r][c][d] === 1) { activeRows[r]++; activeCols[c]++; }
            }
        }

        const transformType = Math.floor(Math.random() * 8); // Random axis flip/rotation (R_u)
        const midDepth = Math.floor(depth/2);

        for (let i = 0; i < SIZE; i++) {
            const moduleI = Math.floor(i / 3);
            const rowIndex = INTERCONNECT_CHANNELS.indexOf(i);
            const rowInterconnectActive = rowIndex !== -1 && interconnects.rows[rowIndex];

            for (let j = 0; j < SIZE; j++) {
                const gateType = kernelFace[i][j];
                const moduleJ = Math.floor(j / 3);
                
                // Pre-calculate Interconnect Sum
                let interconnectSum = 0;
                if (activeInterconnects) {
                    const currentState = lattice[i][j][midDepth];
                    if (rowInterconnectActive) interconnectSum += (activeRows[i] - currentState) * INTERCONNECT_WEIGHT;
                    
                    const colIndex = INTERCONNECT_CHANNELS.indexOf(j);
                    if (colIndex !== -1 && interconnects.cols[colIndex]) {
                        interconnectSum += (activeCols[j] - currentState) * INTERCONNECT_WEIGHT;
                    }
                }

                for (let k = 0; k < depth; k++) {
                    let sumNowIntra = 0, sumNowInter = 0;
                    let sumPrevIntra = 0, sumPrevInter = 0;
                    let kineticEnergy = 0;
                    
                    // Moore Neighborhood Iteration
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            // Apply Random Rotation/Flip Transform (R)
                            let tdi = di, tdj = dj;
                            switch (transformType) {
                                case 1: tdi = -di; break;
                                case 2: tdj = -dj; break;
                                case 3: [tdi, tdj] = [dj, di]; break;
                                case 4: [tdi, tdj] = [-dj, -di]; break;
                                case 5: [tdi, tdj] = [dj, -di]; break;
                                case 6: [tdi, tdj] = [-di, -dj]; break;
                                case 7: [tdi, tdj] = [-dj, di]; break;
                            }

                            for (let dk = -1; dk <= 1; dk++) {
                                if (tdi === 0 && tdj === 0 && dk === 0) continue;
                                
                                const ni = (i + tdi + SIZE) % SIZE;
                                const nj = (j + tdj + SIZE) % SIZE;
                                const nk = (k + dk + depth) % depth;
                                
                                const neighborModuleI = Math.floor(ni / 3);
                                const neighborModuleJ = Math.floor(nj / 3);
                                const isIntraModule = (moduleI === neighborModuleI && moduleJ === neighborModuleJ);
                                
                                const currentNeighborState = lattice[ni][nj][nk];
                                const prevNeighborState = prevLattice[ni][nj][nk];

                                if (isIntraModule) {
                                    if (currentNeighborState === 1) sumNowIntra++;
                                    if (prevNeighborState === 1) sumPrevIntra++;
                                } else {
                                    if (currentNeighborState === 1) sumNowInter++;
                                    if (prevNeighborState === 1) sumPrevInter++;
                                }

                                if(physicsModel === 'lagrangian' && currentNeighborState !== prevNeighborState) {
                                    kineticEnergy++;
                                }
                            }
                        }
                    }

                    const currentState = lattice[i][j][k];
                    let effectiveSum = 0;

                    if (physicsModel === 'lagrangian') {
                        const potentialEnergy = (sumNowIntra * INTRA_MODULE_WEIGHT) + (sumNowInter * INTER_MODULE_WEIGHT);
                        effectiveSum = Math.round(kineticEnergy - potentialEnergy + interconnectSum);
                    } else if (physicsModel === 'wave_dynamics') {
                        const sumNow = sumNowIntra + sumNowInter;
                        const sumPrev = sumPrevIntra + sumPrevInter;
                        const momentum = (sumNow - sumPrev) * WAVE_MOMENTUM;
                        effectiveSum = Math.round(sumNow + momentum + interconnectSum);
                    } else {
                        // Standard Model
                        const totalIntra = (sumNowIntra + sumPrevIntra) * INTRA_MODULE_WEIGHT;
                        const totalInter = (sumNowInter + sumPrevInter) * INTER_MODULE_WEIGHT;
                        effectiveSum = Math.round(totalIntra + totalInter + interconnectSum);
                    }

                    // Apply Micro-Kernel Operator
                    switch (gateType) {
                        case 3: newLattice[i][j][k] = applyXORRule(effectiveSum); break;
                        case 4: newLattice[i][j][k] = applyThresholdRule(effectiveSum); break;
                        case 5: newLattice[i][j][k] = applyMemoryRule(effectiveSum, currentState); break;
                        case 6: newLattice[i][j][k] = applyNOTRule(effectiveSum); break;
                        default: newLattice[i][j][k] = currentState; break;
                    }
                }
            }
        }
        
        // Calculate Metrics Efficiently
        const newMetrics = calculateMetrics(newLattice, lattice, startTime, totalCells, thermalLoadRef);
        
        setMetrics(newMetrics);
        setMetricsHistory(prev => [...prev.slice(-199), newMetrics]);
        
        if (isRecording) {
            setSimulationHistory(prev => [...prev, { lattice: deepCopyLattice(lattice), prevLattice: deepCopyLattice(prevLattice), metrics: newMetrics }]);
        }

        setPrevLattice(lattice);
        setLattice(newLattice);

    }, [lattice, prevLattice, kernelFace, interconnects, depth, totalCells, isRecording, physicsModel]);

    const THERMAL_THRESHOLD = 0.2;
    const MAX_THERMAL_PENALTY_MS = 300;

    useEffect(() => {
        let thermalPenalty = 0;
        if (metrics.thermalLoad > THERMAL_THRESHOLD) {
            const excess = metrics.thermalLoad - THERMAL_THRESHOLD;
            const normalizedExcess = Math.min(1.0, excess / (1.0 - THERMAL_THRESHOLD));
            thermalPenalty = Math.pow(normalizedExcess, 2) * MAX_THERMAL_PENALTY_MS;
        }
        setEffectiveDelay(delay + thermalPenalty);
    }, [delay, metrics.thermalLoad]);

    useEffect(() => {
        if (running) {
            intervalRef.current = window.setInterval(stepLattice, effectiveDelay);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [running, stepLattice, effectiveDelay]);

    const handleStep = () => { if(!isPlaybackMode) { setRunning(false); stepLattice(); } };

    const resetSimulation = (newLattice: Lattice3D, newInterconnects = defaultInterconnects) => {
        setRunning(false);
        setIsPlaybackMode(false);
        setLattice(newLattice);
        setPrevLattice(createEmptyLattice(depth));
        setMetrics({ delta_swastika: 0, latency: 0, energy: 0, thermalLoad: 0 });
        setMetricsHistory([]);
        setSimulationHistory([]);
        setPlaybackIndex(0);
        setInterconnects(deepCopyInterconnects(newInterconnects));
        thermalLoadRef.current = 0;
    }

    const handleReset = () => {
        resetSimulation(generateDefaultLattice(depth));
        setCoreGrid(DEFAULT_CORE_GRID);
        setSelectedPatternId('default-start');
    };
    
    const handleClear = () => {
        resetSimulation(createEmptyLattice(depth));
        setCoreGrid(DEFAULT_CORE_GRID);
        setSelectedPatternId('');
    };

    const handleLoadPattern = (patternId: string) => {
        let newLattice: Lattice3D;
        let newInterconnects = defaultInterconnects;
        let newCoreGrid = DEFAULT_CORE_GRID;

        if (patternId === 'default-start') {
            newLattice = generateDefaultLattice(depth);
        } else {
            const pattern = patterns.find(p => p.id === patternId);
            if (pattern) {
                const savedDepth = pattern.data[0][0].length;
                if (savedDepth !== depth) {
                    newLattice = createEmptyLattice(depth);
                    const midLayerNew = Math.floor(depth / 2);
                    const midLayerOld = Math.floor(savedDepth / 2);
                    for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) {
                        newLattice[i][j][midLayerNew] = pattern.data[i][j][midLayerOld] || 0;
                    }
                } else {
                     newLattice = pattern.data;
                }
                newInterconnects = pattern.interconnects ? deepCopyInterconnects(pattern.interconnects) : defaultInterconnects;
                newCoreGrid = pattern.coreGrid ? pattern.coreGrid.map(row => [...row]) : DEFAULT_CORE_GRID;
            } else {
                newLattice = createEmptyLattice(depth);
            }
        }
        
        setCoreGrid(newCoreGrid);
        resetSimulation(deepCopyLattice(newLattice), newInterconnects);
        setSelectedPatternId(patternId);
    };

    const handleApplyGeneratedPattern = (pattern: number[][]) => {
        const newLattice = createEmptyLattice(depth);
        const midLayer = Math.floor(depth / 2);

        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (pattern[i] && pattern[i][j] !== undefined) {
                    newLattice[i][j][midLayer] = pattern[i][j];
                }
            }
        }
        
        resetSimulation(newLattice);
        setSelectedPatternId('');
    };

    const handleSavePattern = (name: string) => {
      const newPattern: UserPattern = {
        id: `user-${Date.now()}`,
        name,
        data: deepCopyLattice(lattice),
        interconnects: deepCopyInterconnects(interconnects),
        coreGrid: coreGrid.map(row => [...row]),
      };
      setPatterns(prev => [...prev, newPattern]);
      setSelectedPatternId(newPattern.id);
    };

    const handleUpdatePattern = (id: string) => {
      setPatterns(prev => prev.map(p => 
        p.id === id ? { 
            ...p, 
            data: deepCopyLattice(lattice), 
            interconnects: deepCopyInterconnects(interconnects),
            coreGrid: coreGrid.map(row => [...row]) 
        } : p
      ));
    };

    const handleDeletePattern = (id: string) => {
      setPatterns(prev => prev.filter(p => p.id !== id));
      if (selectedPatternId === id) {
          handleReset();
      }
    };

    const handleCellClick = useCallback((i: number, j: number, k: number) => {
        if (running || isPlaybackMode) return;
        setLattice(prev => {
             const newLattice = deepCopyLattice(prev);
             newLattice[i][j][k] = newLattice[i][j][k] === 1 ? 0 : 1;
             return newLattice;
        });
        setSelectedPatternId('');
    }, [running, isPlaybackMode]);

    const handleCoreGridChange = (i: number, j: number, value: number) => {
        if (running || isPlaybackMode) return;
        setCoreGrid(prevGrid => {
            const newGrid = prevGrid.map(row => [...row]);
            newGrid[i][j] = value;
            return newGrid;
        });
    };

    const handleResetCoreGrid = () => {
        if (running || isPlaybackMode) return;
        setCoreGrid(DEFAULT_CORE_GRID);
    };

    const handleToggleInterconnect = useCallback((type: 'rows' | 'cols', index: number) => {
        if (running || isPlaybackMode) return;
        setInterconnects(prev => {
            const newChannels = deepCopyInterconnects(prev);
            newChannels[type][index] = !newChannels[type][index];
            return newChannels;
        });
        setSelectedPatternId('');
    }, [running, isPlaybackMode]);

    // Recording and Playback Handlers
    const handleStart = () => { setRunning(true); };
    const handleStop = () => {
        setRunning(false);
        if (isRecording && simulationHistory.length > 0) {
            setIsPlaybackMode(true);
            setIsRecording(false);
            setPlaybackIndex(simulationHistory.length - 1);
        }
    };
    const handleToggleRecording = () => {
        setIsRecording(prev => {
            const isNowRecording = !prev;
            if (isNowRecording) {
                setSimulationHistory([]);
                setIsPlaybackMode(false);
            }
            return isNowRecording;
        });
    };
    const handleExitPlayback = () => {
        setIsPlaybackMode(false);
        if (simulationHistory.length > 0) {
            const lastFrame = simulationHistory[simulationHistory.length - 1];
            setLattice(lastFrame.lattice);
            setPrevLattice(lastFrame.prevLattice);
            setMetrics(lastFrame.metrics);
        }
        setSimulationHistory([]);
        setPlaybackIndex(0);
    };
    const handleScrub = (index: number) => {
        setPlaybackIndex(index);
    };

    return {
        lattice, prevLattice, coreGrid, kernelFace, running, metrics, delay,
        effectiveDelay, patterns, selectedPatternId, showBorders, metricsHistory, interconnects,
        isRecording, isPlaybackMode, simulationHistory, playbackIndex,
        handleStep, handleReset, handleClear, handleLoadPattern, handleCellClick, 
        handleCoreGridChange, handleResetCoreGrid, handleToggleInterconnect,
        setRunning, setDelay, setShowBorders, setCoreGrid,
        handleSavePattern, handleUpdatePattern, handleDeletePattern, handleApplyGeneratedPattern,
        handleStart, handleStop, handleToggleRecording, handleExitPlayback, handleScrub,
    };
};
