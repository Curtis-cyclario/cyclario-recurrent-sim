
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Lattice3D, MetricsData, UserPattern, GlobalSettings, PhysicsModel } from '../types';
import { SIZE, DEPTH, DEFAULT_CORE_GRID, INTRA_MODULE_WEIGHT, INTER_MODULE_WEIGHT, INTERCONNECT_WEIGHT, INTERCONNECT_CHANNELS } from '../constants';
import { DEFAULT_PATTERNS } from '../patterns';

const STORAGE_KEY = 'cyclario-v5-patterns';
const LATTICE_LENGTH = SIZE * SIZE * DEPTH;

// Helpers for flattened indexing
const getIdx = (i: number, j: number, k: number) => (i * SIZE * DEPTH) + (j * DEPTH) + k;

const calculateMetrics = (
    current: Uint8Array,
    prev: Uint8Array,
    startTime: number,
    thermalLoadRef: React.MutableRefObject<number>
): MetricsData => {
    let deltaCount = 0;
    let activeCells = 0;

    for (let i = 0; i < LATTICE_LENGTH; i++) {
        const val = current[i];
        if (val === 1) activeCells++;
        if ((val ^ prev[i]) === 1) deltaCount++;
    }

    const endTime = performance.now();
    const energy = activeCells / LATTICE_LENGTH;
    const newThermalLoad = thermalLoadRef.current * 0.96 + energy * 0.04;
    thermalLoadRef.current = newThermalLoad;

    return { 
        delta_swastika: Math.sqrt(deltaCount), 
        latency: endTime - startTime, 
        energy, 
        thermalLoad: newThermalLoad 
    };
};

const generateMirroredFace = (core: number[][]): number[][] => {
  const mapToCore = (idx: number) => (idx >= 3 && idx <= 5) ? idx - 3 : (idx < 3 ? 2 - idx : 8 - idx);
  const face = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) {
      face[i][j] = core[mapToCore(i)][mapToCore(j)];
  }
  return face;
};

const generateDefaultLattice = (): Uint8Array => {
  const lat = new Uint8Array(LATTICE_LENGTH);
  const mid = Math.floor(DEPTH / 2);
  lat[getIdx(4, 4, mid)] = 1;
  [1, 7].forEach(r => [1, 7].forEach(c => lat[getIdx(r, c, mid)] = 1));
  return lat;
};

export const useSimulation = ({ globalSettings, physicsModel }: { globalSettings: GlobalSettings, physicsModel: PhysicsModel }) => {
    const [coreGrid, setCoreGrid] = useState<number[][]>(DEFAULT_CORE_GRID);
    const [kernelFace, setKernelFace] = useState<number[][]>(() => generateMirroredFace(DEFAULT_CORE_GRID));
    const [lattice, setLattice] = useState<Uint8Array>(() => generateDefaultLattice());
    const [prevLattice, setPrevLattice] = useState<Uint8Array>(() => new Uint8Array(LATTICE_LENGTH));
    const [running, setRunning] = useState<boolean>(false);
    const [metrics, setMetrics] = useState<MetricsData>({ delta_swastika: 0, latency: 0, energy: 0, thermalLoad: 0 });
    const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
    const [delay, setDelay] = useState<number>(100);
    const [effectiveDelay, setEffectiveDelay] = useState<number>(delay);
    const [patterns, setPatterns] = useState<UserPattern[]>([]);
    const [selectedPatternId, setSelectedPatternId] = useState<string>('default-start');
    const [showBorders, setShowBorders] = useState<boolean>(true);
    const [interconnects, setInterconnects] = useState({ rows: [false, false, false], cols: [false, false, false] });
    
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPlaybackMode, setIsPlaybackMode] = useState<boolean>(false);
    const [simulationHistory, setSimulationHistory] = useState<{ lattice: Uint8Array; prevLattice: Uint8Array; metrics: MetricsData; }[]>([]);
    const [playbackIndex, setPlaybackIndex] = useState<number>(0);

    const intervalRef = useRef<number | null>(null);
    const thermalLoadRef = useRef<number>(0);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            const upgraded = parsed.map((p: any) => ({ ...p, data: new Uint8Array(Object.values(p.data)) }));
            setPatterns([...DEFAULT_PATTERNS.map(dp => ({ ...dp, data: new Uint8Array(dp.data as any) })), ...upgraded]);
        } else {
            setPatterns(DEFAULT_PATTERNS.map(dp => ({ ...dp, data: new Uint8Array(dp.data as any) })));
        }
    }, []);

    useEffect(() => {
        setKernelFace(generateMirroredFace(coreGrid));
    }, [coreGrid]);

    const stepLattice = useCallback(() => {
        const start = performance.now();
        const next = new Uint8Array(LATTICE_LENGTH);
        const rowActive = interconnects.rows.some(v => v);
        const colActive = interconnects.cols.some(v => v);

        for (let i = 0; i < SIZE; i++) {
            const mI = Math.floor(i / 3);
            const rIdx = INTERCONNECT_CHANNELS.indexOf(i);
            const rOn = rIdx !== -1 && interconnects.rows[rIdx];

            for (let j = 0; j < SIZE; j++) {
                const gate = kernelFace[i][j];
                const mJ = Math.floor(j / 3);
                const cIdx = INTERCONNECT_CHANNELS.indexOf(j);
                const cOn = cIdx !== -1 && interconnects.cols[cIdx];

                for (let k = 0; k < DEPTH; k++) {
                    let sum = 0;
                    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) for (let dk = -1; dk <= 1; dk++) {
                        if (di === 0 && dj === 0 && dk === 0) continue;
                        const ni = (i + di + SIZE) % SIZE;
                        const nj = (j + dj + SIZE) % SIZE;
                        const nk = (k + dk + DEPTH) % DEPTH;
                        const nMI = Math.floor(ni / 3);
                        const nMJ = Math.floor(nj / 3);
                        const weight = (mI === nMI && mJ === nMJ) ? INTRA_MODULE_WEIGHT : INTER_MODULE_WEIGHT;
                        if (lattice[getIdx(ni, nj, nk)] === 1) sum += weight;
                    }

                    if (rOn || cOn) sum += INTERCONNECT_WEIGHT;

                    const currentVal = lattice[getIdx(i, j, k)];
                    let nextVal: 0 | 1 = 0;
                    switch (gate) {
                        case 3: nextVal = (sum % 2 !== 0 && sum > 0) ? 1 : 0; break; // XOR
                        case 4: nextVal = sum >= 2 ? 1 : 0; break; // THRESHOLD
                        case 5: nextVal = currentVal === 0 ? (sum === 1 ? 1 : 0) : (sum > 1 ? 0 : 1); break; // MEMORY
                        case 6: nextVal = sum === 0 ? 1 : 0; break; // NOT
                    }
                    next[getIdx(i, j, k)] = nextVal;
                }
            }
        }

        const newMetrics = calculateMetrics(next, lattice, start, thermalLoadRef);
        setMetrics(newMetrics);
        setMetricsHistory(h => [...h.slice(-149), newMetrics]);
        if (isRecording) setSimulationHistory(h => [...h, { lattice: new Uint8Array(lattice), prevLattice: new Uint8Array(prevLattice), metrics: newMetrics }]);
        setPrevLattice(lattice);
        setLattice(next);
    }, [lattice, prevLattice, kernelFace, interconnects, isRecording]);

    useEffect(() => {
        const thermalPenalty = metrics.thermalLoad > 0.2 ? Math.pow((metrics.thermalLoad - 0.2) / 0.8, 2) * 400 : 0;
        setEffectiveDelay(delay + thermalPenalty);
    }, [delay, metrics.thermalLoad]);

    useEffect(() => {
        if (running) intervalRef.current = window.setInterval(stepLattice, effectiveDelay);
        else if (intervalRef.current) clearInterval(intervalRef.current);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running, stepLattice, effectiveDelay]);

    return {
        lattice, prevLattice, coreGrid, kernelFace, running, metrics, delay, effectiveDelay,
        patterns, selectedPatternId, showBorders, metricsHistory, interconnects,
        isRecording, isPlaybackMode, simulationHistory, playbackIndex,
        handleStep: () => { if(!isPlaybackMode) { setRunning(false); stepLattice(); } },
        handleReset: () => { setLattice(generateDefaultLattice()); setPrevLattice(new Uint8Array(LATTICE_LENGTH)); setRunning(false); },
        handleClear: () => { setLattice(new Uint8Array(LATTICE_LENGTH)); setRunning(false); },
        handleLoadPattern: (id: string) => {
            const p = patterns.find(x => x.id === id);
            if (p) { setLattice(new Uint8Array(p.data)); setCoreGrid(p.coreGrid || DEFAULT_CORE_GRID); }
            setSelectedPatternId(id); setRunning(false);
        },
        handleCellClick: (i: number, j: number, k: number) => {
            setLattice(prev => { const n = new Uint8Array(prev); n[getIdx(i, j, k)] = n[getIdx(i, j, k)] ? 0 : 1; return n; });
        },
        handleCoreGridChange: (i: number, j: number, v: number) => {
            setCoreGrid(g => { const n = g.map(r => [...r]); n[i][j] = v; return n; });
        },
        handleResetCoreGrid: () => setCoreGrid(DEFAULT_CORE_GRID),
        handleToggleInterconnect: (type: 'rows' | 'cols', idx: number) => {
            setInterconnects(prev => { const n = { rows: [...prev.rows], cols: [...prev.cols] }; n[type][idx] = !n[type][idx]; return n; });
        },
        setRunning, setDelay, setShowBorders, setCoreGrid,
        handleSavePattern: (name: string) => {
            const p: UserPattern = { id: `u-${Date.now()}`, name, data: new Uint8Array(lattice), coreGrid, interconnects };
            setPatterns(prev => [...prev, p]);
        },
        handleUpdatePattern: (id: string) => setPatterns(prev => prev.map(p => p.id === id ? { ...p, data: new Uint8Array(lattice), coreGrid } : p)),
        handleDeletePattern: (id: string) => setPatterns(prev => prev.filter(p => p.id !== id)),
        handleApplyGeneratedPattern: (grid: number[][]) => {
            const n = new Uint8Array(LATTICE_LENGTH);
            const mid = Math.floor(DEPTH/2);
            for(let i=0; i<9; i++) for(let j=0; j<9; j++) if(grid[i]?.[j]) n[getIdx(i, j, mid)] = 1;
            setLattice(n); setRunning(false);
        },
        handleStart: () => setRunning(true),
        handleStop: () => { setRunning(false); if(isRecording) setIsPlaybackMode(true); },
        handleToggleRecording: () => setIsRecording(!isRecording),
        handleExitPlayback: () => { setIsPlaybackMode(false); setSimulationHistory([]); },
        handleScrub: setPlaybackIndex
    };
};
