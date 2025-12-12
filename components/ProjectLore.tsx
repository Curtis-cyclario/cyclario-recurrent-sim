
import React from 'react';

export const ProjectLore: React.FC = () => (
    <div className="flex items-center justify-center p-8 h-full fade-in-component">
        <div className="component-panel max-w-2xl p-8 rounded-xl text-center">
            <h1 className="text-3xl font-orbitron font-bold text-cyan-300 mb-6">PROJECT LORE</h1>
            <p className="text-gray-300 mb-4 leading-relaxed">
                The Recurrent Automaton project explores the Cohesive Toroidal Engine—a computational substrate inspired by neuromorphic principles.
            </p>
            <p className="text-gray-300 leading-relaxed">
                By abandoning linear instruction sets for cyclical, self-organizing rules, we aim to unlock adaptive resilience in AI and robotics. The toroidal topology ensures information conservation, creating a robust foundation for emergent intelligence.
            </p>
        </div>
    </div>
);
