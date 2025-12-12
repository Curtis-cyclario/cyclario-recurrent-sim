
import React from 'react';

const TensorGrid: React.FC<{ grid: number[][]; highlightCore?: boolean; title: string; cellSize?: string }> = ({ grid, highlightCore, title, cellSize = 'w-8 h-8' }) => (
    <div className="flex flex-col items-center gap-3">
        <h3 className="font-orbitron text-lg text-cyan-300 tracking-wider">{title}</h3>
        <div role="grid" className="grid gap-px bg-slate-700/50 p-px rounded-md" style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`}}>
            {grid.flat().map((cell, index) => {
                const row = Math.floor(index / grid.length);
                const col = index % grid.length;
                const isCore = highlightCore && (row >= 3 && row <= 5) && (col >= 3 && col <= 5);
                return (
                    <div key={index} className={`flex items-center justify-center aspect-square text-center ${isCore ? 'bg-cyan-900/40' : 'bg-slate-900/50'} ${cellSize}`}>
                        <span className={`font-mono transition-colors ${isCore ? 'text-cyan-300' : 'text-gray-400'}`} style={{fontSize: grid.length === 3 ? '1rem' : '0.6rem'}}>
                            {cell}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

const Arrow: React.FC<{ rotation: number }> = ({ rotation }) => (
    <svg width="48" height="48" viewBox="0 0 24 24" className="text-cyan-400/40 opacity-75" style={{ transform: `rotate(${rotation}deg)` }}>
        <path d="M4 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 6L20 12L14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);


export const AnalysisPanel: React.FC<{ coreGrid: number[][], kernelFace: number[][] }> = ({ coreGrid, kernelFace }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 fade-in-component text-gray-300">
            <h1 className="text-3xl font-orbitron font-bold text-cyan-300 tracking-wider holographic-title mb-8">KERNEL ARCHITECTURE</h1>
            
            <div className="flex flex-col lg:flex-row items-center justify-around gap-8 w-full">
                <TensorGrid grid={coreGrid} title="Core Kernel (W)" cellSize="w-12 h-12" />

                <div className="flex flex-col items-center justify-center gap-4 my-8 lg:my-0">
                    <Arrow rotation={0} />
                    <div className="flex items-center gap-4 -my-4">
                        <Arrow rotation={270} />
                        <span className="font-orbitron text-cyan-500/80 text-sm tracking-widest">MIRROR</span>
                        <Arrow rotation={90} />
                    </div>
                    <Arrow rotation={180} />
                </div>

                <TensorGrid grid={kernelFace} highlightCore title="Mirrored Face (F)" cellSize="w-8 h-8"/>
            </div>

            <div className="max-w-3xl text-center mt-12 component-panel p-6 rounded-lg">
                <p className="text-sm leading-relaxed">
                    The 3x3 <strong className="text-cyan-400 text-glow">Core Kernel (W)</strong> is the genetic seed of the automaton. Its nine values define the logic gates for the entire system.
                    This kernel is then expanded via a <strong className="text-cyan-400 text-glow">bidirectional mirroring</strong> operation to form the 9x9 <strong className="text-cyan-400 text-glow">Mirrored Face (F)</strong>.
                    This architecture ensures the logic is cohesive across the toroidal grid, allowing complex, emergent behavior to arise from a simple, editable set of rules.
                </p>
            </div>
        </div>
    );
};