
import React from 'react';

export const CoreConcepts: React.FC = () => (
    <div className="p-8 text-gray-300 fade-in-component max-w-3xl mx-auto">
        <h1 className="text-3xl font-orbitron font-bold text-cyan-300 mb-6 text-center">CORE CONCEPTS</h1>
        <div className="space-y-6">
            <div className="component-panel p-6 rounded-lg">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Hierarchical Simulation</h3>
                <p className="text-sm leading-relaxed">The system operates on a dual-rail binary lattice. Logic propagates from the micro-kernel level up to the 3D symmetrical folding stage.</p>
            </div>
            <div className="component-panel p-6 rounded-lg">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Micro-Kernel (Level 1)</h3>
                <p className="text-sm leading-relaxed">A 3x3 reversible grid gate defined by a fixed meta-kernel. It applies logic operators (XOR, Threshold) spatially to the input field.</p>
            </div>
            <div className="component-panel p-6 rounded-lg">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Dimensional Folding (Level 2 & 3)</h3>
                <p className="text-sm leading-relaxed">Planar layers are stacked and subjected to a global symbolic constraint (Swastika Symmetry Map) to enforce rotational invariance and quantization in the 3D update.</p>
            </div>
        </div>
    </div>
);
