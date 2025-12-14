
import React, { useEffect, useState, useRef } from 'react';
import type { MetricsData, Lattice3D } from '../types';
import { SIZE, DEPTH } from '../constants';
import { Tooltip } from './Tooltip';

interface PhysicsEngineProps {
  metrics: MetricsData;
  lattice: Lattice3D;
  running: boolean;
}

const EquationBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border border-slate-700 bg-slate-900/50 p-4 rounded-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-1">
            <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-emerald-500/50 transition-colors"></div>
        </div>
        <h4 className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">{title}</h4>
        <div className="font-mono text-slate-300 text-sm leading-relaxed">
            {children}
        </div>
    </div>
);

const DataMetric: React.FC<{ label: string; value: string; unit: string; color?: string }> = ({ label, value, unit, color = 'text-slate-100' }) => (
    <div className="flex flex-col">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-2">
            <span className={`font-mono text-xl ${color}`}>{value}</span>
            <span className="text-xs text-slate-600 font-bold">{unit}</span>
        </div>
    </div>
);

interface LithographyNode {
    name: string;
    energyPerOp: number; // Joules
    costIndex: number; // 1-100 scale
    year: number;
    description: string;
}

const NODES: LithographyNode[] = [
    { name: '180nm', energyPerOp: 1000e-15, costIndex: 5, year: 1999, description: 'Legacy / Low Cost' },
    { name: '90nm', energyPerOp: 250e-15, costIndex: 15, year: 2004, description: 'Mature / IoT' },
    { name: '28nm', energyPerOp: 40e-15, costIndex: 35, year: 2011, description: 'Planar Standard' },
    { name: '7nm', energyPerOp: 5e-15, costIndex: 65, year: 2018, description: 'FinFET High Perf' },
    { name: '2nm', energyPerOp: 1e-15, costIndex: 95, year: 2025, description: 'GAAFET Cutting Edge' },
];

const TIME_STEP_PS = 10; // 10 picoseconds per step
const GATES_PER_CELL = 9; // Kernel size

export const PhysicsEngine: React.FC<PhysicsEngineProps> = ({ metrics, lattice, running }) => {
    const [phlops, setPhlops] = useState<number>(0);
    const [simTime, setSimTime] = useState<number>(0);
    const [peakFlops, setPeakFlops] = useState<number>(0);
    const [selectedNode, setSelectedNode] = useState<LithographyNode>(NODES[2]); // Default 28nm
    const [hamiltonian, setHamiltonian] = useState<number>(0);

    const activeCellCount = lattice.flat(2).reduce((sum, cell) => sum + cell, 0);

    // Calculate Hamiltonian H = E_site - E_coupling
    // E_site = Sum(n_i)
    // E_coupling = Sum(n_i * n_j) for nearest neighbors
    // Note: Adjusted for Toroidal Topology (periodic boundary conditions)
    useEffect(() => {
        let siteE = 0;
        let couplingE = 0;
        const size = lattice.length;
        const depth = lattice[0][0].length;
        const omega0 = 1.0; 
        const J = 0.5; // Coupling constant

        for(let i=0; i<size; i++) {
            for(let j=0; j<size; j++) {
                for(let k=0; k<depth; k++) {
                    if (lattice[i][j][k] === 1) {
                        siteE += omega0;
                        
                        // Toroidal check: wrapping indices
                        const ni = (i + 1) % size;
                        const nj = (j + 1) % size;
                        const nk = (k + 1) % depth;

                        // Check neighbors in positive directions to count each bond exactly once
                        if (lattice[ni][j][k] === 1) couplingE += J;
                        if (lattice[i][nj][k] === 1) couplingE += J;
                        if (lattice[i][j][nk] === 1) couplingE += J;
                    }
                }
            }
        }
        setHamiltonian(siteE - couplingE);
    }, [lattice]);

    useEffect(() => {
        if (running) {
            const opsThisStep = activeCellCount * GATES_PER_CELL;
            setPhlops(prev => prev + opsThisStep);
            setSimTime(prev => prev + TIME_STEP_PS);

            const instantaneousPetaFlops = (opsThisStep / (TIME_STEP_PS * 1e-12)) / 1e15;
            setPeakFlops(instantaneousPetaFlops);
        }
    }, [running, activeCellCount]);

    const totalPower_mW = (activeCellCount * selectedNode.energyPerOp) / (TIME_STEP_PS * 1e-12) * 1000;
    const totalEnergy_nJ = (phlops * selectedNode.energyPerOp) * 1e9;
    
    return (
        <div className="w-full h-full p-4 sm:p-8 overflow-y-auto fade-in-component">
            <header className="flex flex-col md:flex-row justify-between items-end border-b border-slate-700 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-orbitron font-bold text-slate-100 tracking-widest">PHYSICS EVALUATION</h1>
                    <p className="text-xs font-mono text-emerald-500 mt-1 uppercase">/// Photonic Integrated Circuit Diagnostics ///</p>
                </div>
                <div className="text-right mt-4 md:mt-0 flex gap-6 items-end">
                    <div className="text-right">
                         <div className="text-[10px] text-slate-500 uppercase">Process Node</div>
                         <div className="font-mono text-xl text-cyan-300">{selectedNode.name}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase">Elapsed Time</div>
                        <div className="font-mono text-2xl text-amber-500">
                            {simTime.toLocaleString()} <span className="text-sm text-slate-600">ps</span>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Lithography Selector */}
            <div className="mb-8 p-4 bg-slate-900/50 border border-slate-700 rounded-sm">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lithography Process Node</h3>
                    <span className="text-[10px] font-mono text-slate-500">{selectedNode.description} ({selectedNode.year})</span>
                </div>
                <div className="relative h-10 w-full flex items-center justify-between px-2 bg-slate-800/50 rounded-sm">
                    {/* Track */}
                    <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-slate-700 -z-0"></div>
                    
                    {NODES.map((node) => {
                        const isSelected = selectedNode.name === node.name;
                        return (
                            <button
                                key={node.name}
                                onClick={() => setSelectedNode(node)}
                                className={`relative z-10 flex flex-col items-center group focus:outline-none`}
                            >
                                <div className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${isSelected ? 'bg-cyan-500 border-cyan-300 scale-125' : 'bg-slate-900 border-slate-600 group-hover:border-cyan-500'}`} />
                                <span className={`absolute top-5 text-[10px] font-mono transition-colors ${isSelected ? 'text-cyan-300 font-bold' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {node.name}
                                </span>
                            </button>
                        )
                    })}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                     {/* Manufacturing Cost Indicator */}
                     <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                            <span>Wafer Cost</span>
                            <span>{selectedNode.costIndex > 80 ? 'EXTREME' : selectedNode.costIndex > 40 ? 'HIGH' : 'LOW'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-rose-500 transition-all duration-500" style={{width: `${selectedNode.costIndex}%`}}></div>
                        </div>
                     </div>
                     {/* Efficiency Indicator */}
                     <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                            <span>Efficiency Scale</span>
                            <span>{selectedNode.energyPerOp < 10e-15 ? 'ULTRA' : 'STANDARD'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: `${100 - (Math.log10(selectedNode.energyPerOp)/Math.log10(NODES[0].energyPerOp))*100}%`}}></div>
                        </div>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Primary Counters */}
                <div className="col-span-2 bg-slate-900 border border-slate-700 p-6 rounded-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Cumulative Logic Throughput</h3>
                        <div className="font-mono text-4xl md:text-5xl text-emerald-400 truncate">
                            {phlops.toLocaleString()}
                        </div>
                        <div className="text-xs text-emerald-500/50 mt-1 font-mono uppercase">Total Phlops (Photonic Operations)</div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-end">
                        <DataMetric 
                            label="Instantaneous Rate" 
                            value={peakFlops.toFixed(4)} 
                            unit="PetaPhlops" 
                            color="text-emerald-200"
                        />
                         <DataMetric 
                            label="Hamiltonian (Ĥ)" 
                            value={hamiltonian.toFixed(1)} 
                            unit="eV" 
                            color="text-fuchsia-400"
                        />
                    </div>
                </div>

                {/* Power & Energy */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-sm">
                        <DataMetric 
                            label="Optical Power" 
                            value={totalPower_mW.toFixed(2)} 
                            unit="mW" 
                            color="text-amber-400"
                        />
                        <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-1 transition-all duration-300" style={{ width: `${Math.min(100, (totalPower_mW / 100) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-sm">
                        <DataMetric 
                            label="Total Energy" 
                            value={totalEnergy_nJ.toFixed(4)} 
                            unit="nJ" 
                            color="text-blue-400"
                        />
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-sm">
                         <DataMetric 
                            label="Waveguide Temp" 
                            value={(metrics.thermalLoad * 8.5).toFixed(3)} 
                            unit="°C" 
                            color={metrics.thermalLoad > 0.5 ? 'text-red-400' : 'text-slate-300'}
                        />
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-sm">
                        <DataMetric 
                            label="Swastika Metric" 
                            value={metrics.delta_swastika.toFixed(3)} 
                            unit="Δs" 
                            color="text-purple-400"
                        />
                    </div>
                </div>
            </div>

            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                Governing Equations & Evaluations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <EquationBox title="1. Hamiltonian of the Lattice (Live)">
                    <p className="mb-2 text-slate-400 text-xs">Total energy of coupled resonators.</p>
                    <div className="text-lg bg-slate-950 p-2 rounded border border-slate-800 text-center text-fuchsia-400">
                        Ĥ ≈ {hamiltonian.toFixed(2)}
                    </div>
                     <div className="mt-1 text-center text-[10px] text-slate-500">
                        H = E_site - E_coupling (Toroidal)
                    </div>
                </EquationBox>

                <EquationBox title="2. Nonlinear Kerr Effect">
                    <p className="mb-2 text-slate-400 text-xs">Self-phase modulation within LiNbO3 kernels.</p>
                    <div className="text-lg bg-slate-950 p-2 rounded border border-slate-800 text-center">
                        Δn = n₂I = (3χ⁽³⁾ / 4n₀ε₀c) |E|²
                    </div>
                </EquationBox>

                <EquationBox title="3. The Kayek Conjecture (Stability)">
                    <p className="mb-2 text-slate-400 text-xs">Verification of topological protection magnitude.</p>
                    <div className="text-lg bg-slate-950 p-2 rounded border border-slate-800 text-center">
                        lim(t→∞) [ ΔS⁽ᵗ⁾ / log(N) ] ≥ ħ/2
                    </div>
                </EquationBox>

                <EquationBox title="4. Phlop Calculation">
                     <p className="mb-2 text-slate-400 text-xs">Standardized metric for photonic logic throughput.</p>
                     <div className="text-base bg-slate-950 p-2 rounded border border-slate-800 text-center">
                        P = ∫ (ρ · Γ · ν) dt
                     </div>
                     <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                        <span>ρ: Density</span>
                        <span>Γ: Kernel Size</span>
                        <span>ν: Freq</span>
                     </div>
                </EquationBox>
                 <EquationBox title="5. Thermal Dissipation">
                     <p className="mb-2 text-slate-400 text-xs">Heat generation via non-adiabatic transitions.</p>
                     <div className="text-base bg-slate-950 p-2 rounded border border-slate-800 text-center">
                        Q = κ · ∇²T + Φ_dis
                     </div>
                </EquationBox>
                 <EquationBox title="6. Waveguide Dispersion">
                     <p className="mb-2 text-slate-400 text-xs">Pulse broadening constraints.</p>
                     <div className="text-base bg-slate-950 p-2 rounded border border-slate-800 text-center">
                        β(ω) ≈ β₀ + β₁Δω + ½β₂Δω²
                     </div>
                </EquationBox>
            </div>
        </div>
    );
};
