
import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="component-panel rounded-lg p-6 mb-6">
        <h2 className="text-xl font-orbitron font-bold text-cyan-300 mb-4 tracking-wider border-b border-slate-700 pb-2">{title}</h2>
        <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
            {children}
        </div>
    </div>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="mt-4">
        <h3 className="text-lg font-orbitron font-bold text-cyan-400/90 mb-2">{title}</h3>
        <div className="pl-4 border-l-2 border-slate-700 space-y-3">{children}</div>
    </div>
);

const ListItem: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <li><p><strong className="text-cyan-400 text-glow">{title}:</strong> {children}</p></li>
);

const Code: React.FC<{children: React.ReactNode}> = ({children}) => (
    <pre className="font-mono text-cyan-300 bg-slate-900/60 p-3 my-2 rounded-md text-sm border border-slate-700/50 overflow-x-auto whitespace-pre-wrap">
        <code>{children}</code>
    </pre>
);

export const FrameworkSpecs: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 sm:p-8 fade-in-component text-gray-300 overflow-y-auto">
            <div className="max-w-4xl w-full">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-orbitron font-bold text-cyan-300 tracking-wider holographic-title mb-2">SYSTEM ARCHITECTURE</h1>
                    <p className="text-cyan-500/80 mt-1 text-base">Cyclario’s 3D Neuromorphic Quantum Photonic Logic</p>
                </header>
                
                <p className="text-center text-gray-400 mb-8 italic">
                    This dual strategy governs the physical architecture, operational model, and the mathematical correctness of the system, often explicitly detailed within generative AI tasks used for simulation prototyping (referred to as the "AI Studio prompt").
                </p>

                <Section title="I. Leveraging Symbolic Constraints (Rigour and Architecture Definition)">
                    <p>Symbolic constraints are mathematical and structural rules imposed on the system to ensure computational integrity, reversibility, and geometric stability, defining the "Blueprints first" approach.</p>
                    <SubSection title="1. The Photonic DSL and Conservation Laws">
                        <p>The overall rigour and structure of the architecture are determined by the <strong>Photonic DSL (Domain Specific Language)</strong>.</p>
                        <ul className="space-y-2">
                            <ListItem title="Reversibility Requirement">The DSL mandates that the design enforces <strong>conservation laws</strong>, specifically <strong>phase/intensity conservation</strong>. This is crucial because true energy conservation in photonic logic is tied to <strong>reversible computation</strong>. The fundamental building blocks of the architecture are therefore <strong>$3 \times 3$ reversible grid gates</strong>.</ListItem>
                            <ListItem title="Gate Proofs">Specific fundamental components, such as the <strong>RSWAP</strong> or <strong>BEND</strong> gates, are used in abstract animations and proofs to demonstrate this required reversibility and conservation dynamically.</ListItem>
                        </ul>
                    </SubSection>
                    <SubSection title="2. Hierarchical Logic and Kernel System">
                        <p>The logic operation is structurally constrained using a hierarchical approach:</p>
                        <ul className="space-y-2">
                           <ListItem title="Meta-Kernel">The core operation begins with a fixed $3 \times 3$ groove matrix ($W$), which acts as a <strong>meta-kernel</strong>.</ListItem>
                           <ListItem title="Micro-Kernel Allocation">The weights within this meta-kernel (specifically 3, 4, 5, and 6) dictate the spatial address of four distinct callable <strong>micro-kernel operators</strong> ($K_w$). These micro-kernels theoretically perform specific logic functions like <strong>XOR, Threshold, or Memory</strong> operations on the dual-rail inputs.</ListItem>
                        </ul>
                    </SubSection>
                    <SubSection title="3. Geometric and Rotational Invariance">
                        <p>The final state calculation integrates a non-trivial symbolic constraint to maintain architectural stability:</p>
                        <ul className="space-y-2">
                            {/* FIX: The TSX parser was incorrectly identifying 'C' and 't' as components/variables in the mathematical notation. Wrapping the notation in a string literal expression `{'...'}` prevents this misinterpretation. */}
                            <ListItem title="Swastika Symmetry Map (σ)">The final state update equation ({'($\\mathbf{C}^{(t+1)}$)'}) explicitly incorporates the symbolic constraint $\sigma$, which represents the <strong>Swastika Symmetry Map (U+0968 SWASTIKA)</strong>.</ListItem>
                            <ListItem title="Enforcing Geometry">The purpose of applying this constraint is to fold the composite field and ensure the emergent computational geometry maintains the intrinsic <strong>rotational invariance</strong> required by the system design. This design emphasis on symbolic rigour sets Cyclario's core research apart from conventional tensor frameworks.</ListItem>
                        </ul>
                    </SubSection>
                </Section>

                <Section title="II. Leveraging Neuromorphic Principles (Efficiency and Execution)">
                    <p>Neuromorphic principles guide the operational paradigm and the selection of photonic hardware to maximize energy efficiency, speed, and parallel processing capability, often defined as providing <strong>"ultra-efficient, massively parallel hardware"</strong>.</p>
                     <SubSection title="1. Asynchronous and Event-Driven Operation">
                        <ul className="space-y-2">
                           <ListItem title="Spiking Paradigm">The system mimics the human brain's nervous system by operating on a <strong>"spiking paradigm"</strong>. In this model, computational units (artificial neurons) are <strong>event-driven</strong>, only becoming active when they receive or emit information (spikes).</ListItem>
                           <ListItem title="Efficiency Gains">This reliance on <strong>asynchrony</strong> is a fundamental neuromorphic principle that bypasses the limitations imposed by <strong>Amdahl's Law</strong> and drastically <strong>reduces power consumption</strong> by avoiding the overhead of constant clock distribution necessary in traditional synchronous digital circuits.</ListItem>
                        </ul>
                    </SubSection>
                     <SubSection title="2. Speed, Parallelism, and Integration">
                        <ul className="space-y-2">
                           <ListItem title="Hyper-Speed">Photonic systems leverage the properties of light for computation, enabling <strong>ultrafast operations</strong> and achieving <strong>sub-nanosecond latencies</strong>. This instantaneous processing power is essential for real-time field applications, such as the instantaneous adjustments needed for the <strong>Aerogrow closed-loop grow system</strong> in precision agriculture.</ListItem>
                           <ListItem title="In-Memory Computing">Neuromorphic systems, including Cyclario's photonic logic, aim to overcome the "von Neumann bottleneck" by supporting <strong>in-memory computing</strong>, integrating memory and processing to reduce energy-intensive data movement.</ListItem>
                        </ul>
                    </SubSection>
                     <SubSection title="3. Advanced 3D Architecture">
                        <ul className="space-y-2">
                            <ListItem title="Dimensional Stacking">The research focuses on prototyping <strong>3D neuromorphic quantum photonic logic architectures</strong>. The architecture achieves <strong>"full 3D logic"</strong> by stacking the aggregated $9 \times 9$ planar layer (the "81-tile space") <strong>six times along the Z axis</strong>.</ListItem>
                            <ListItem title="Quantum Enhancement">The architecture is intended to exploit advanced <strong>quantum phenomena</strong> like <strong>superposition and entanglement</strong> for enhanced capabilities, high-dimensional encoding, and universal logical operations. This fabrication complexity is planned to be realized using advanced methods like Two-Photon Polymerization (TPP/2PP).</ListItem>
                        </ul>
                    </SubSection>
                </Section>
                
                <Section title="III. Physics Evals & Kayek Conjecture">
                    <p>Formal checks required by the Photonic DSL compiler, defining the operational physics and theoretical underpinnings of the simulation.</p>
                    <SubSection title="Physics Evaluations (PE)">
                        <div className="space-y-5">
                            <div>
                                <p><strong className="text-cyan-400 text-glow">PE-1: Local Phase Continuity</strong></p>
                                <Code>{'∮_∂tile ∇φ·dl = 0 (mod 2π)'}</Code>
                                <p className="text-sm text-gray-400 italic pl-2">Implementation: After every micro-kernel execution, assert that the phase difference between any two adjacent tiles equals the line integral of ∇φ along their shared edge.</p>
                            </div>
                            <div>
                                <p><strong className="text-cyan-400 text-glow">PE-2: Energy–Momentum Conservation</strong></p>
                                <Code>{'|E_out|² – |E_in|² + Σ_j P_j Δt = 0 , |error| < ε'}</Code>
                                <p className="text-sm text-gray-400 italic pl-2">Where E is energy (pJ), ε is 10⁻⁴, and Pj is instantaneous power flow, checked via scattering-matrix S.</p>
                            </div>
                             <div>
                                <p><strong className="text-cyan-400 text-glow">PE-3: Optical Reciprocity</strong></p>
                                <Code>{'S_ij = S_ji*'}</Code>
                                <p className="text-sm text-gray-400 italic pl-2">Every primitive gate must satisfy this for all ports unless explicitly tagged as non-reciprocal.</p>
                            </div>
                            <div>
                                <p><strong className="text-cyan-400 text-glow">PE-4: Group-Velocity Limit Check</strong></p>
                                <Code>{'Δt_min(tile) = n_eff · L_tile / c ≥ τ_clock/α'}</Code>
                                <p className="text-sm text-gray-400 italic pl-2">Sets a lower bound on latency, where α ≥ 1 is a safety margin.</p>
                            </div>
                        </div>
                    </SubSection>
                    <SubSection title="Kayek Conjecture (KC)">
                        <div className="space-y-5">
                            <div>
                                <p><strong className="text-cyan-400 text-glow">KC-1: Universal Decomposition</strong><br/>Any reversible photonic transformation G that satisfies PE 1-4 and preserves global energy can be decomposed into a finite sequence of gates from the universal set:</p>
                                <Code>{'𝔘₀ = { RSWAP(θ), BEND(ϕ), PHASE(δ) }'}</Code>
                                <p className="text-sm text-gray-400 italic pl-2">With gate parameters programmable to arbitrary precision.</p>
                            </div>
                            <div>
                                <p><strong className="text-cyan-400 text-glow">KC-2: Micro-Kernel Sufficiency</strong><br/>Every Level-1 micro-kernel (K_w) is realizable by at most nine 𝔘₀ primitives arranged in a depth-three planar circuit on a single tile.</p>
                                <p className="text-sm text-gray-400 italic pl-2">This is verified symbolically by the DSL verifier using Euler-ZYZ decomposition.</p>
                            </div>
                        </div>
                    </SubSection>
                    <p className="mt-4 italic text-gray-400">
                        <strong>Conclusion:</strong> The conjecture reduces the hardware synthesis problem to a placement-and-route task over the universal gate set 𝔘₀, guided by calibration data.
                    </p>
                </Section>
            </div>
        </div>
    );
};
