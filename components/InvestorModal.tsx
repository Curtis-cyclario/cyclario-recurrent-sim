
import React from 'react';

export const InvestorModal: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 fade-in-component text-gray-300">
            <div className="relative max-w-3xl w-full component-panel rounded-lg p-8 overflow-hidden">
                 <div 
                    className="absolute inset-0 z-0" 
                    style={{
                        backgroundImage: 'linear-gradient(rgba(0, 170, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 170, 255, 0.03) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                        animation: 'bg-pan 20s linear infinite'
                    }}
                />
                <div className="relative z-10">
                    <h1 className="text-3xl font-orbitron font-bold text-cyan-300 tracking-wider holographic-title mb-6 text-center">PROJECT LORE</h1>
                    <div className="text-base text-gray-300 space-y-4 leading-relaxed">
                        <p>The Recurrent Automaton project began as an effort to transcend the bottlenecks of traditional von Neumann architectures. Inspired by the principles of neuromorphic computing and cellular automata theory, the core innovation is the Cohesive Toroidal Engine.</p>
                        <p>Its design posits that truly robust artificial intelligence will not arise from massive, brittle models, but from simple, recurrent rules that allow complexity and resilience to emerge naturally. The toroidal topology ensures that information is never lost, only transformed, creating a powerful substrate for self-organizing, adaptive systems.</p>
                        <p>This simulator is a window into that philosophy—a digital laboratory for exploring the profound potential of computation built on emergence and feedback, rather than linear instruction.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};