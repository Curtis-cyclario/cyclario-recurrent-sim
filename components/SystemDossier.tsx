
import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="component-panel rounded-sm p-6 mb-6 bg-slate-900/40 border border-slate-800">
        <h2 className="text-sm font-orbitron font-black text-cyan-400 mb-4 tracking-[0.2em] border-b border-slate-800 pb-2 uppercase">{title}</h2>
        <div className="text-xs text-slate-400 space-y-4 leading-relaxed font-mono">
            {children}
        </div>
    </div>
);

export const SystemDossier: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-8 overflow-y-auto">
            <div className="max-w-4xl w-full">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-orbitron font-black text-white tracking-[0.3em] mb-2">SYSTEM_DOSSIER</h1>
                    <p className="text-cyan-600 text-[10px] font-mono uppercase tracking-[0.5em]">Photonic DSL Protocol Specification v4.2.1</p>
                </header>
                
                <Section title="01_SUBSTRATE_UNIFICATION">
                    <p>The simulator executes on a virtualized <strong>Si/LiNbO₃</strong> hybrid platform. High-index contrast waveguides facilitate the routing of dual-rail optical signals through the toroidal manifold.</p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-sm">
                            <span className="text-cyan-500 font-bold block mb-1">PROPAGATION_LOSS</span>
                            <span className="text-white">&lt; 0.08 dB/cm</span>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-sm">
                            <span className="text-indigo-500 font-bold block mb-1">MODULATION_BW</span>
                            <span className="text-white">&gt; 110 GHz</span>
                        </div>
                    </div>
                </Section>

                <Section title="02_ALGORITHMIC_CONSTRAINTS">
                    <p>The engine enforces structural reversibility via the <strong>Kayek Unitary Transform</strong>. Each kernel operation (XOR, THRESHOLD, MEMORY) acts as a local phase-gate within the larger coherence field.</p>
                    <ul className="list-disc pl-4 space-y-2 mt-2 text-slate-500">
                        <li>Phase continuity enforced at all waveguide junctions (∇φ·dl = 0).</li>
                        <li>Energy conservation calculated via post-quantization residual check.</li>
                        <li>Symmetrical folding (σ) ensures rotational invariance across Z-stacking layers.</li>
                    </ul>
                </Section>

                <Section title="03_INTEGRATED_METRICS">
                    <p>The <strong>Swastika Functional (Δs)</strong> tracks the magnitude of state change across the symbolic manifold. High Δs values indicate chaotic evolution, while low Δs suggests stable resonance or decay.</p>
                </Section>
                
                <footer className="mt-12 text-center border-t border-slate-900 pt-6">
                    <span className="hud-label opacity-20">END_OF_DOCUMENT // BRANCHALLETIEL_CLEARANCE_REQUIRED</span>
                </footer>
            </div>
        </div>
    );
};
