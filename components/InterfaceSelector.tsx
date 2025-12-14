
import React from 'react';
import type { SimulationMode } from '../types';
import { Tooltip } from './Tooltip';

interface InterfaceSelectorProps {
  currentMode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
}

const primarySimModes: { id: SimulationMode; name: string; description: string }[] = [
  { id: 'MICRO_KERNEL', name: 'CORE', description: 'Unified Gate Array: The 3x3 core kernel logic.' },
  { id: 'CYCLIC_MANIFOLD', name: 'FACE', description: 'Recursive 9x9: The bilinearly-mirrored 9x9x3 toroidal lattice.' },
  { id: 'VOLUMETRIC_LATTICE', name: 'QUBE', description: 'QubeIt 9x9x9: Volumetric 9x9x9 computation in 3D.' },
  { id: 'QUANTIZATION_FIELD', name: 'QUANT', description: "Quadratic Quantisation: Abstract macro-dynamic visualization." },
];

const secondarySimModes: { id: SimulationMode; name: string; description: string }[] = [
  { id: 'ENTROPY_MODE', name: 'ENTROPY', description: 'System Disorder: Visualizes entropy via the Swastika metric (Δs).' },
  { id: 'SIGNAL_PATHWAYS', name: 'SIGNAL', description: 'Pathways: Visualizes signal propagation and causal connections.' },
  { id: 'PATTERN_GENERATOR', name: 'PATTERN', description: 'Generates complex, repeatable patterns based on kernel evolution.' },
  { id: 'GLYPH_MAP', name: 'GLYPH', description: 'Self-Organizing Map: Cluster activation patterns into glyphs.' },
];

const physicsMode: { id: SimulationMode; name: string; description: string } = 
  { id: 'PHYSICS_EVAL', name: 'PHYSICS', description: 'Hardcore Evaluation: Phlop counters, governing equations, and optical power metrics.' };


const infoModesTop: { id: SimulationMode; name: string; description: string }[] = [
  { id: 'SYSTEM_ARCHITECTURE', name: 'ARCHITECTURE', description: 'Unified System Specification: Kernel topology, mathematical model, and core concepts.' },
];

const infoModesBottom: { id: SimulationMode; name: string; description: string }[] = [
    { id: 'PROJECT_LORE', name: 'LORE', description: 'Project Lore: The background and philosophy of the Recurrent Automaton.' },
    { id: 'FRAMEWORK', name: 'SPECS', description: 'Framework Specifications: Details on the underlying simulation framework.' },
];


const SelectorButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  name: string;
  description: string;
  special?: boolean;
}> = ({ isActive, onClick, name, description, special }) => {
  return (
    <Tooltip text={description}>
      <button
        onClick={onClick}
        className={`relative w-full p-3 text-center transition-all duration-300 ease-in-out transform focus:outline-none rounded-sm group
          ${isActive 
            ? 'bg-cyan-500/20 border-cyan-400/80' 
            : special 
                ? 'bg-slate-900/80 border-emerald-700/50 hover:bg-slate-800 hover:border-emerald-500' 
                : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-700/50 hover:border-slate-500'
          }
          border h-full flex items-center justify-center
          `}
      >
        {/* Active Indicator Corner */}
        {isActive && (
            <>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
            </>
        )}
        
        {/* Hover Corners (only if not active) */}
        {!isActive && (
            <>
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-current opacity-0 group-hover:opacity-40 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-current opacity-0 group-hover:opacity-40 transition-opacity" />
            </>
        )}

        {isActive && <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00aaff]" />}
        
        <h4 className={`font-orbitron font-bold tracking-widest text-sm sm:text-base 
            ${isActive ? 'text-cyan-300' : special ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-200'}`}
        >
            {name}
        </h4>
      </button>
    </Tooltip>
  );
};

export const InterfaceSelector: React.FC<InterfaceSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="w-full max-w-6xl mx-auto my-4 fade-in-component interface-selector-container" style={{ animationDelay: '0.1s' }}>
        <div className="component-panel p-2 rounded-sm flex flex-col gap-2">
            
            {/* Top Row: Core, Face, Qube, Quant | Physics, Architecture */}
            <div className="flex flex-col md:flex-row gap-2 h-14">
                <div className="flex-[2] grid grid-cols-4 gap-2 h-full">
                    {primarySimModes.map(mode => (
                        <SelectorButton
                            key={mode.id}
                            isActive={currentMode === mode.id}
                            onClick={() => onModeChange(mode.id)}
                            name={mode.name}
                            description={mode.description}
                        />
                    ))}
                </div>
                <div className="flex-[1] grid grid-cols-2 gap-2 h-full">
                     <SelectorButton
                        isActive={currentMode === physicsMode.id}
                        onClick={() => onModeChange(physicsMode.id)}
                        name={physicsMode.name}
                        description={physicsMode.description}
                        special
                    />
                    {infoModesTop.map(mode => (
                        <SelectorButton
                            key={mode.id}
                            isActive={currentMode === mode.id}
                            onClick={() => onModeChange(mode.id)}
                            name={mode.name}
                            description={mode.description}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Row: Entropy, Signal, Pattern, Glyph | Lore, Specs */}
            <div className="flex flex-col md:flex-row gap-2 h-14">
                <div className="flex-[2] grid grid-cols-4 gap-2 h-full">
                    {secondarySimModes.map(mode => (
                        <SelectorButton
                            key={mode.id}
                            isActive={currentMode === mode.id}
                            onClick={() => onModeChange(mode.id)}
                            name={mode.name}
                            description={mode.description}
                        />
                    ))}
                </div>
                <div className="flex-[1] grid grid-cols-2 gap-2 h-full">
                     {infoModesBottom.map(mode => (
                        <SelectorButton
                            key={mode.id}
                            isActive={currentMode === mode.id}
                            onClick={() => onModeChange(mode.id)}
                            name={mode.name}
                            description={mode.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
