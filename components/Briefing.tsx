import React from 'react';

const ConceptSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="component-panel rounded-lg p-6">
        <h2 className="text-xl font-orbitron font-bold text-cyan-300 mb-2 tracking-wider">{title}</h2>
        <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
            {children}
        </div>
    </div>
);

export const Briefing: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 fade-in-component text-gray-300">
            <h1 className="text-3xl font-orbitron font-bold text-cyan-300 tracking-wider holographic-title mb-8">CORE CONCEPTS</h1>
            <div className="max-w-4xl w-full space-y-6">
                <ConceptSection title="Hierarchical Simulation Model">
                    {/* FIX: The TSX parser was incorrectly identifying 'C' as a component. Wrapping the math notation in a string literal expression to prevent misinterpretation. */}
                    <p>The simulation proceeds through three hierarchical levels, moving from micro-kernel operation to 3D symmetrical folding. The system operates on a lattice of dual-rail binary tiles ({'($\\mathbf{C}$)'}).</p>
                </ConceptSection>
                <ConceptSection title="Level 1: Core Micro-Kernel Operation">
                   <p>The foundational element is the $3 \times 3$ reversible grid gate, where the logic is directed by a fixed meta-kernel matrix. This meta-kernel allocates specific callable micro-kernel operators (e.g., Threshold, XOR, Memory) spatially. The total convolution result is an aggregation of the nine micro-kernel results from the neighborhood, which incorporates a random axis flip/rotation essential for scrambling protection.</p>
                </ConceptSection>
                 <ConceptSection title="Level 2 & 3: Dimensional Folding">
                   <p>The system stacks planar layers and applies a master gate function, a parity operator, and a global symbolic constraint known as the Swastika Symmetry Map ($\sigma$). The final 3D state update incorporates summation across all stacked layers and a mandatory quantization step that maps the output back into a discrete dual-rail state space, ensuring rotational invariance.</p>
                </ConceptSection>
            </div>
        </div>
    );
};