
import React from 'react';

const Equation: React.FC<{label: string, children: React.ReactNode}> = ({ label, children }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <div className="text-cyan-500 text-xs font-bold mb-2 uppercase tracking-widest">{label}</div>
        <div className="font-mono text-gray-300 text-sm md:text-base">{children}</div>
    </div>
);

export const SystemModel: React.FC = () => {
    return (
        <div className="flex flex-col items-center p-8 space-y-6 fade-in-component max-w-4xl mx-auto">
            <h1 className="text-2xl font-orbitron font-bold text-cyan-300">SYSTEM MODEL</h1>
            <div className="w-full space-y-4">
                <Equation label="1. Micro-Kernel Operator">
                    H<sup>(t)</sup> = Σ (R · K<sub>w</sub>(C<sup>(t)</sup>))
                </Equation>
                <Equation label="2. Planar Convolution">
                    L<sup>(t)</sup> = F(Σ (R · H<sup>(t)</sup>), P)
                </Equation>
                <Equation label="3. 3D State Update">
                     C<sup>(t+1)</sup> = Q<sub>3D</sub>(F(Σ L<sup>(t)</sup>, σ))
                </Equation>
                <Equation label="4. Protection Metric (Swastika Functional)">
                    ΔS = ||σ(C<sup>(t+1)</sup> ⊕ C<sup>(t)</sup>)||<sub>2</sub>
                </Equation>
            </div>
        </div>
    );
};
