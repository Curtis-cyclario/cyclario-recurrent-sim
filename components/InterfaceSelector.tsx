
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
  { id: 'ENTROPY_MODE', name: 'CHAOS', description: 'Visualizes the system\'s entropy and unpredictability.' },
  { id: 'PATTERN_GENERATOR', name: 'PATTERN', description: 'Generates complex, repeatable patterns based on kernel evolution.' },
  { id: 'SIGNAL_PATHWAYS', name: 'LINK', description: 'Visualizes signal propagation and communication pathways between cells.' },
  { id: 'GLYPH_MAP', name: 'GLYPH', description: 'Self-Organizing Map: Cluster activation patterns into glyphs.' },
];

const infoModesTop: { id: SimulationMode; name: string; description: string }[] = [
  { id: 'KERNEL_ARCHITECTURE', name: 'ANALYSIS', description: 'Kernel Architecture: Visualization of the core kernel and mirrored face.' },
  { id: 'SYSTEM_MODEL', name: 'MODEL', description: 'System Model: The mathematical framework governing the automaton.' },
  { id: 'CORE_CONCEPTS', name: 'CONCEPTS', description: 'Core Concepts: Learn about emergent computational structures.' },
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
}> = ({ isActive, onClick, name, description }) => {
  return (
    <Tooltip text={description}>
      <button
        onClick={onClick}
        className={`relative flex-1 p-3 text-center transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400 rounded-md
          ${isActive ? 'bg-cyan-500/20 border-cyan-400/80' : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-700/50 hover:border-slate-500'}`}
      >
        <div className="absolute top-1 right-1 h-2 w-2 rounded-full transition-colors duration-300" style={{
            backgroundColor: isActive ? '#00aaff' : '#334155',
            boxShadow: isActive ? '0 0 6px #00aaff' : 'none'
        }}/>
        <h4 className="font-orbitron font-bold tracking-widest text-base sm:text-lg" style={{color: isActive ? '#67e8f9' : '#94a3b8', textShadow: isActive ? '0 0 8px rgba(103, 232, 249, 0.5)' : 'none'}}>{name}</h4>
      </button>
    </Tooltip>
  );
};

export const InterfaceSelector: React.FC<InterfaceSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-4 fade-in-component interface-selector-container" style={{ animationDelay: '0.1s' }}>
        <div className="component-panel p-2 rounded-lg">
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-2">
                <div className="flex-1 flex flex-col items-stretch justify-center gap-2">
                    <div className="flex items-stretch justify-center gap-2">
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
                    <div className="flex items-stretch justify-center gap-2">
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
                </div>
                <div className="w-px bg-slate-700/70 self-stretch mx-2 hidden md:block"></div>
                <div className="h-px bg-slate-700/70 my-2 md:hidden"></div>
                <div className="flex-1 flex flex-col items-stretch justify-center gap-2">
                    <div className="flex items-stretch justify-center gap-2">
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
                     <div className="flex items-stretch justify-center gap-2">
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
    </div>
  );
};
