
import React from 'react';

const TechBox: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className="" }) => (
    <div className={`component-panel p-6 rounded-sm ${className}`}>
        <h3 className="font-orbitron text-sm font-bold text-cyan-400 mb-4 tracking-widest uppercase border-b border-slate-700 pb-2">
            {title}
        </h3>
        <div className="text-gray-300">
            {children}
        </div>
    </div>
);

const TensorGrid: React.FC<{ grid: number[][]; highlightCore?: boolean; title: string; cellSize?: string }> = ({ grid, highlightCore, title, cellSize = 'w-8 h-8' }) => (
    <div className="flex flex-col items-center gap-3">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">{title}</div>
        <div role="grid" className="grid gap-px bg-slate-700/50 p-px rounded-sm border border-slate-700" style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`}}>
            {grid.flat().map((cell, index) => {
                const row = Math.floor(index / grid.length);
                const col = index % grid.length;
                const isCore = highlightCore && (row >= 3 && row <= 5) && (col >= 3 && col <= 5);
                return (
                    <div key={index} className={`flex items-center justify-center aspect-square text-center ${isCore ? 'bg-cyan-900/40' : 'bg-slate-900/50'} ${cellSize}`}>
                        <span className={`font-mono transition-colors ${isCore ? 'text-cyan-300' : 'text-slate-600'}`} style={{fontSize: grid.length === 3 ? '0.9rem' : '0.6rem'}}>
                            {cell}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

const Equation: React.FC<{label: string, children: React.ReactNode}> = ({ label, children }) => (
    <div className="bg-slate-950/50 p-3 rounded-sm border border-slate-800 flex flex-col gap-1">
        <div className="text-emerald-500/70 text-[10px] font-bold uppercase tracking-widest">{label}</div>
        <div className="font-mono text-slate-200 text-sm">{children}</div>
    </div>
);

interface SystemArchitectureProps {
    coreGrid: number[][];
    kernelFace: number[][];
}

export const SystemArchitecture: React.FC<SystemArchitectureProps> = ({ coreGrid, kernelFace }) => {
    return (
        <div className="w-full h-full p-4 sm:p-8 overflow-y-auto fade-in-component">
            <header className="mb-8 border-b border-slate-800 pb-4">
                 <h1 className="text-2xl font-orbitron font-bold text-slate-100 tracking-widest">SYSTEM ARCHITECTURE</h1>
                 <p className="text-xs font-mono text-cyan-500 mt-1 uppercase">/// Unified Kernel & Model Specification ///</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visual Architecture */}
                <TechBox title="Kernel Topology" className="lg:col-span-2">
                    <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
                         <TensorGrid grid={coreGrid} title="Core Kernel (W)" cellSize="w-12 h-12" />
                         
                         <div className="flex flex-col items-center gap-2 text-slate-500">
                            <span className="font-mono text-xs">TRANSFORM</span>
                            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                         </div>

                         <TensorGrid grid={kernelFace} highlightCore title="Mirrored Face (F)" cellSize="w-8 h-8"/>
                    </div>
                    <p className="mt-6 text-sm font-mono text-slate-400 border-t border-slate-800 pt-4">
                        The 3x3 <strong className="text-cyan-400">Core Kernel (W)</strong> defines the genetic seed. This is expanded via bidirectional mirroring to form the 9x9 <strong className="text-cyan-400">Mirrored Face (F)</strong>, ensuring logic cohesion across the toroidal lattice.
                    </p>
                </TechBox>

                {/* Mathematical Model */}
                <TechBox title="Mathematical Framework">
                    <div className="space-y-4">
                        <Equation label="1. Micro-Kernel Operator">
                            H<sup>(t)</sup> = Σ (R · K<sub>w</sub>(C<sup>(t)</sup>))
                        </Equation>
                        <Equation label="2. Planar Convolution">
                            L<sup>(t)</sup> = F(Σ (R · H<sup>(t)</sup>), P)
                        </Equation>
                        <Equation label="3. 3D State Update">
                             C<sup>(t+1)</sup> = Q<sub>3D</sub>(F(Σ L<sup>(t)</sup>, σ))
                        </Equation>
                    </div>
                     <p className="mt-4 text-xs text-slate-500 font-mono">
                        * Q<sub>3D</sub> denotes the volumetric quantization step.
                        <br/>
                        * σ represents the rotational symmetry constraint.
                    </p>
                </TechBox>

                {/* Core Concepts */}
                <TechBox title="Operational Hierarchy">
                    <ul className="space-y-4 text-sm leading-relaxed text-slate-300">
                        <li>
                            <strong className="text-emerald-400 block mb-1 font-mono text-xs uppercase">Level 1: Micro-Kernel</strong>
                            A 3x3 reversible grid gate defined by a fixed meta-kernel. It applies logic operators (XOR, Threshold) spatially to the input field using a random axis flip/rotation (R).
                        </li>
                        <li>
                            <strong className="text-emerald-400 block mb-1 font-mono text-xs uppercase">Level 2: Planar Convolution</strong>
                            The results of micro-kernels are aggregated on the planar layer, subject to the Master Gate Function (F) and Parity Operator (P).
                        </li>
                         <li>
                            <strong className="text-emerald-400 block mb-1 font-mono text-xs uppercase">Level 3: Dimensional Folding</strong>
                            Planar layers are stacked ($Z=6$) and subjected to the Swastika Symmetry Map ($\sigma$) to enforce rotational invariance in the final 3D state update.
                        </li>
                    </ul>
                </TechBox>

            </div>
        </div>
    );
};
