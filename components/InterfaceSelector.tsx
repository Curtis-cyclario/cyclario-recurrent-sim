
import React from 'react';
import type { SimulationMode } from '../types';
import { Tooltip } from './Tooltip';

interface InterfaceSelectorProps {
  currentMode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
}

const primarySimModes: { id: SimulationMode; name: string; description: string }[] = [
  { id: 'MICRO_KERNEL', name: 'CORE', description: 'Kernel Processor: The 3x3 core gate logic.' },
  { id: 'CYCLIC_MANIFOLD', name: 'FACE', description: 'Planar Array: The mirrored 9x9 toroidal lattice.' },
  { id: 'VOLUMETRIC_LATTICE', name: 'QUBE', description: 'Volumetric Stack: 3D computation in 9x9x6 space.' },
  { id: 'QUANTIZATION_FIELD', name: 'HELIOS', description: "Heliostat Engine: Concentric quantization shells." },
];

const secondarySimModes: { id: SimulationMode; name: string; description: string }[] = [
  { id: 'ENTROPY_MODE', name: 'ENTROPY', description: 'Entropy Refractor: Spectral refractive distortion (Δs).' },
  { id: 'SIGNAL_PATHWAYS', name: 'PATHWAY', description: 'Pathways Monitor: Causal propagation links.' },
  { id: 'PATTERN_GENERATOR', name: 'GEN_VIS', description: 'Pattern History: Temporal evolution trails.' },
  { id: 'GLYPH_MAP', name: 'GLYPH', description: 'Signal SOM: Latent clustering of lattice states.' },
];

const physicsMode: { id: SimulationMode; name: string; description: string } = 
  { id: 'PHYSICS_EVAL', name: 'PHYSICS', description: 'Hardcore Evaluation: Phlop counters and PIC diagnostics.' };


const infoModesTop: { id: SimulationMode; name: string; description: string }[] = [
  { id: 'SYSTEM_ARCHITECTURE', name: 'SPEC', description: 'Unified Architecture: Kernel topology and math model.' },
];

const infoModesBottom: { id: SimulationMode; name: string; description: string }[] = [
    { id: 'PROJECT_LORE', name: 'LORE', description: 'System Lore: The philosophy of Cyclario.' },
    { id: 'FRAMEWORK', name: 'DOSSIER', description: 'System Dossier: Detailed DSL technical specs.' },
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
        className={`relative w-full group flex flex-col items-center justify-center p-2.5 transition-all duration-300 border h-full rounded-sm
          ${isActive 
            ? 'bg-cyan-500/15 border-cyan-400 shadow-[inset_0_0_15px_rgba(34,211,238,0.2)]' 
            : special 
                ? 'bg-emerald-950/20 border-emerald-900/50 hover:bg-emerald-900/30 hover:border-emerald-500' 
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800 hover:border-slate-600'
          }
          `}
      >
        {isActive && <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>}
        <span className={`font-orbitron font-black text-[9px] sm:text-xs tracking-[0.25em] uppercase
            ${isActive ? 'text-cyan-300 text-glow' : special ? 'text-emerald-500' : 'text-slate-500 group-hover:text-slate-300'}`}
        >
            {name}
        </span>
      </button>
    </Tooltip>
  );
};

export const InterfaceSelector: React.FC<InterfaceSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="w-full max-w-6xl mx-auto my-2 interface-selector-container">
        <div className="component-panel p-2 rounded-sm flex flex-col gap-2 bg-slate-950/60 border-slate-800">
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
