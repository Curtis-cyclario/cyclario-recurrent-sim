
import React from 'react';

const MatrixGrid: React.FC<{ grid: number[][]; highlightCore?: boolean; title: string; }> = ({ grid, highlightCore, title }) => (
    <div className="flex flex-col items-center gap-3">
        <h3 className="font-orbitron text-lg text-cyan-300 tracking-wider">{title}</h3>
        <div className="grid gap-px bg-slate-700/50 p-px rounded-md" style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`}}>
            {grid.flat().map((cell, index) => {
                const row = Math.floor(index / grid.length);
                const col = index % grid.length;
                const isCore = highlightCore && (row >= 3 && row <= 5) && (col >= 3 && col <= 5);
                return (
                    <div key={index} className={`flex items-center justify-center w-8 h-8 ${isCore ? 'bg-cyan-900/60' : 'bg-slate-900/50'}`}>
                        <span className={`text-xs font-mono ${isCore ? 'text-cyan-300' : 'text-gray-500'}`}>{cell}</span>
                    </div>
                );
            })}
        </div>
    </div>
);

export const KernelArchitecture: React.FC<{ coreGrid: number[][], kernelFace: number[][] }> = ({ coreGrid, kernelFace }) => {
    return (
        <div className="flex flex-col items-center p-8 text-gray-300 fade-in-component">
            <h1 className="text-2xl font-orbitron font-bold text-cyan-300 mb-8">KERNEL ARCHITECTURE</h1>
            <div className="flex flex-wrap justify-center gap-12">
                <MatrixGrid grid={coreGrid} title="Core Kernel (W)" />
                <div className="flex items-center text-cyan-500/50 text-xl">➔ Mirror Expansion ➔</div>
                <MatrixGrid grid={kernelFace} highlightCore title="Mirrored Face (F)" />
            </div>
        </div>
    );
};
