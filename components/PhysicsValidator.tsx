
import React, { useEffect, useState } from 'react';
import type { MetricsData, Lattice3D } from '../types';
import { SIZE, DEPTH } from '../constants';
import { Tooltip } from './Tooltip';

interface PhysicsValidatorProps {
  metrics: MetricsData;
  lattice: Lattice3D;
  running: boolean;
}

const EquationBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-sm relative group">
        <h4 className="hud-label text-[7px] mb-3 opacity-50 uppercase">{title}</h4>
        <div className="font-mono text-slate-300 text-[11px] leading-relaxed">
            {children}
        </div>
    </div>
);

const NODES = [
    { name: '180nm', energyPerOp: 1000e-15 },
    { name: '28nm', energyPerOp: 40e-15 },
    { name: '7nm', energyPerOp: 5e-15 },
    { name: '2nm', energyPerOp: 1e-15 },
];

export const PhysicsValidator: React.FC<PhysicsValidatorProps> = ({ metrics, lattice, running }) => {
    const [phlops, setPhlops] = useState<number>(0);
    const [simTime, setSimTime] = useState<number>(0);
    const [selectedNode, setSelectedNode] = useState(NODES[1]);

    useEffect(() => {
        if (running) {
            // Lattice is Uint8Array, use reduce directly
            const activeCount = lattice.reduce((s, v) => s + v, 0);
            setPhlops(p => p + (activeCount * 9));
            setSimTime(s => s + 10);
        }
    }, [running, lattice]);

    return (
        <div className="w-full h-full p-8 overflow-y-auto">
            <header className="flex justify-between items-end border-b border-slate-800 pb-4 mb-8">
                <div>
                    <h1 className="text-2xl font-orbitron font-black text-white tracking-[0.2em]">PHYSICS_VALIDATOR</h1>
                    <p className="hud-label text-emerald-500 mt-1 opacity-70">REAL_TIME_PIC_DIAGNOSTICS</p>
                </div>
                <div className="text-right">
                    <span className="hud-label opacity-40">ELAPSED_PHASE</span>
                    <span className="font-orbitron font-black text-xl text-cyan-400">{simTime} <small className="text-[10px]">ps</small></span>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 component-panel p-6 bg-slate-900/60 flex flex-col justify-center border-emerald-500/20">
                    <span className="hud-label mb-2 opacity-50">LOGIC_THROUGHPUT</span>
                    <div className="font-orbitron font-black text-4xl text-emerald-400 truncate tracking-widest">
                        {phlops.toLocaleString()} <span className="text-xs">PHLOPS</span>
                    </div>
                </div>
                <div className="component-panel p-6 bg-slate-900/60 flex flex-col justify-center border-amber-500/20">
                    <span className="hud-label mb-2 opacity-50">OPTICAL_LOAD</span>
                    <div className="font-orbitron font-black text-2xl text-amber-400">
                        {(phlops * selectedNode.energyPerOp * 1e9).toFixed(4)} <span className="text-xs">nJ</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <EquationBox title="LATTICE_HAMILTONIAN">
                    Ĥ = Σ ω₀nᵢ - J Σ nᵢnⱼ <br/>
                    <span className="text-indigo-400 mt-1 block">CALCULATING ENERGY RESONANCE...</span>
                </EquationBox>
                <EquationBox title="KERR_NONLINEARITY">
                    Δn = n₂I = (3χ⁽³⁾ / 4n₀ε₀c) |E|² <br/>
                    <span className="text-cyan-400 mt-1 block">PHASE_GATE_STABILITY: NOMINAL</span>
                </EquationBox>
            </div>

            <div className="mt-8 flex gap-4">
                {NODES.map(node => (
                    <button 
                        key={node.name}
                        onClick={() => setSelectedNode(node)}
                        className={`flex-1 py-2 font-orbitron font-bold text-[9px] border transition-all ${selectedNode.name === node.name ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-slate-800 text-slate-600 hover:border-slate-600'}`}
                    >
                        {node.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
