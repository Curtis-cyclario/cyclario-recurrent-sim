
import React from 'react';
import { GATE_NAMES, GATE_BG_COLORS, GATE_DESCRIPTIONS, KERNEL_PRESETS } from '../constants';
import { Tooltip } from './Tooltip';

interface KernelEditorProps {
    coreGrid: number[][];
    onGridChange: (i: number, j: number, value: number) => void;
    onReset: () => void;
    isDisabled: boolean;
    onLoadPreset: (grid: number[][]) => void;
}

export const KernelEditor: React.FC<KernelEditorProps> = ({ coreGrid, onGridChange, onReset, isDisabled, onLoadPreset }) => {
    const currentPresetName = KERNEL_PRESETS.find(p => JSON.stringify(p.grid) === JSON.stringify(coreGrid))?.name || 'custom';
    
    return (
        <div className="component-panel p-5 rounded-sm w-full bg-slate-900/40">
            <div className="flex items-center justify-between mb-5">
                <h3 className="hud-label text-cyan-400">LOGIC_KERNEL_MATRIX</h3>
                <span className="font-mono text-[8px] text-slate-600">3x3 ADJACENCY</span>
            </div>

            <div className="mb-6">
                <label className="hud-label opacity-40 text-[7px] mb-1.5 ml-1">TOPOLOGY_PRESET</label>
                <select
                    value={currentPresetName}
                    onChange={(e) => {
                        const selectedPreset = KERNEL_PRESETS.find(p => p.name === e.target.value);
                        if (selectedPreset) onLoadPreset(selectedPreset.grid.map(row => [...row]));
                    }}
                    disabled={isDisabled}
                    className="bg-slate-950 border border-slate-800 text-cyan-300 text-[10px] font-orbitron font-bold tracking-[0.1em] rounded-sm focus:border-cyan-500 block w-full p-2.5 disabled:opacity-20 appearance-none cursor-pointer"
                >
                    {currentPresetName === 'custom' && <option value="custom">CUSTOM_OVERRIDE</option>}
                    {KERNEL_PRESETS.map(preset => (
                        <option key={preset.name} value={preset.name}>{preset.name.toUpperCase().replace(' ', '_')}</option>
                    ))}
                </select>
            </div>

            <div className={`grid grid-cols-3 gap-2 transition-all ${isDisabled ? 'grayscale opacity-30' : ''}`}>
                {coreGrid.map((row, i) =>
                    row.map((cell, j) => {
                        const bgColorClass = GATE_BG_COLORS[cell as keyof typeof GATE_BG_COLORS] || 'bg-slate-900 border-slate-700';
                        return (
                            <Tooltip key={`${i}-${j}`} text={GATE_DESCRIPTIONS[cell as keyof typeof GATE_DESCRIPTIONS]}>
                                <div className="relative group">
                                    <select
                                        value={cell}
                                        onChange={(e) => onGridChange(i, j, parseInt(e.target.value))}
                                        disabled={isDisabled}
                                        className={`w-full aspect-square border-2 font-orbitron font-black text-[10px] tracking-tighter appearance-none text-center cursor-pointer transition-all focus:outline-none focus:border-white/50 rounded-sm ${bgColorClass}`}
                                    >
                                        {Object.entries(GATE_NAMES).map(([key, name]) => (
                                            <option key={key} value={key} className="bg-slate-950">{name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute top-1 right-1.5 pointer-events-none">
                                        <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                                    </div>
                                </div>
                            </Tooltip>
                        )
                    })
                )}
            </div>
            
            <button
                onClick={onReset}
                disabled={isDisabled}
                className="mt-6 w-full py-3 bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-slate-500 hover:text-amber-400 font-orbitron font-extrabold text-[10px] tracking-[0.22em] transition-all disabled:opacity-20 rounded-sm"
            >
                RESET_CORE_STATE
            </button>
        </div>
    );
};
