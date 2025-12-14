
import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="component-panel rounded-sm p-6 mb-6 bg-slate-900 border border-slate-700">
        <h2 className="text-xl font-orbitron font-bold text-blue-400 mb-4 tracking-wider border-b border-slate-800 pb-2">{title}</h2>
        <div className="text-sm text-slate-300 space-y-3 leading-relaxed font-mono">
            {children}
        </div>
    </div>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4">
        <h3 className="text-md font-bold text-slate-200 mb-2 uppercase tracking-wide">{title}</h3>
        <div className="pl-4 border-l-2 border-slate-700 space-y-3">{children}</div>
    </div>
);

const ListItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <li><p><strong className="text-sky-400">{title}:</strong> {children}</p></li>
);

const Code: React.FC<{children: React.ReactNode}> = ({children}) => (
    <pre className="font-mono text-emerald-400 bg-slate-950 p-3 my-2 rounded-sm text-xs border border-slate-800 overflow-x-auto whitespace-pre-wrap">
        <code>{children}</code>
    </pre>
);

export const FrameworkSpecs: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 sm:p-8 text-slate-300 overflow-y-auto">
            <div className="max-w-4xl w-full">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-orbitron font-bold text-slate-100 tracking-wider mb-2">SYSTEM ARCHITECTURE</h1>
                    <p className="text-slate-500 mt-1 text-sm font-mono uppercase">Photonic Integrated Circuit Specification (Rev 4.1)</p>
                </header>
                
                <Section title="I. Material Platform & Geometric Unification">
                    <p>The system simulates a hybrid material platform designed for edge computing, leveraging the specific advantages of <strong>Silicon Nitride (Si₃N₄)</strong> and <strong>Lithium Niobate (LiNbO₃)</strong> on a Silicon substrate.</p>
                    
                    <SubSection title="1. Heterogeneous Integration">
                        <ul className="space-y-2">
                           <ListItem title="Si₃N₄ (Silicon Nitride)">Used for passive waveguiding layers due to its ultra-low propagation loss (&lt; 0.1 dB/m) and broad transparency window. It forms the backbone of the "Cyclic Manifold" routing.</ListItem>
                           <ListItem title="LiNbO₃ (Lithium Niobate)">Thin-film lithium niobate (TFLN) is utilized for active modulation regions (the "Micro-Kernels"). Its high Pockels coefficient enables electro-optic switching at sub-nanosecond speeds.</ListItem>
                        </ul>
                    </SubSection>

                    <SubSection title="2. Geometric Unification Structure">
                         <p>The "Geometric Unification" refers to the physical mapping of the logical 9x9x6 toroidal lattice onto a physical 3D chip stack.</p>
                         <ul className="space-y-2">
                            <ListItem title="Inter-Layer Vias (ILVs)">Vertical photonic transport is achieved not by electrical vias, but by <strong>adiabatic interlayer couplers</strong> that transfer optical modes between stacked Si₃N₄ layers with minimal scattering.</ListItem>
                            <ListItem title="Toroidal Unfolding">The logical torus is physically realized using a "folded Clos network" topology on the chip, eliminating long wraparound waveguides that would introduce excessive latency. This unification ensures that the logical adjacency matches physical adjacency.</ListItem>
                         </ul>
                    </SubSection>
                </Section>

                <Section title="II. Symbolic Constraints (DSL)">
                    <p>Symbolic constraints are mathematical and structural rules imposed on the system to ensure computational integrity and reversibility.</p>
                    <SubSection title="The Photonic DSL">
                        <ul className="space-y-2">
                            <ListItem title="Reversibility Requirement">Design enforces <strong>conservation laws</strong>. Fundamental units are $3 \times 3$ reversible unitary operators.</ListItem>
                            <ListItem title="Swastika Symmetry Map (σ)">The final state update explicitly incorporates the symbolic constraint $\sigma$ to enforce <strong>rotational invariance</strong> in the 3D signal folding.</ListItem>
                        </ul>
                    </SubSection>
                </Section>
                
                <Section title="III. Physics Evals (Kayek Conjecture)">
                    <p>Formal verification checks for the optical solver.</p>
                    <SubSection title="Physics Evaluations (PE)">
                        <div className="space-y-5">
                            <div>
                                <p><strong className="text-sky-400">PE-1: Local Phase Continuity</strong></p>
                                <Code>{'∮_∂tile ∇φ·dl = 0 (mod 2π)'}</Code>
                            </div>
                            <div>
                                <p><strong className="text-sky-400">PE-2: Energy–Momentum Conservation</strong></p>
                                <Code>{'|E_out|² – |E_in|² + Σ_j P_j Δt = 0 , |error| < ε'}</Code>
                            </div>
                        </div>
                    </SubSection>
                </Section>
            </div>
        </div>
    );
};
