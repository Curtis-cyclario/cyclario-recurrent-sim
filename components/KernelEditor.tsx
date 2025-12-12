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
        <div className="component-panel p-4 rounded-lg w-full">
            <h3 className="text-lg font-orbitron font-bold text-cyan-300 mb-3 text-center tracking-wider">
                KERNEL EDITOR
            </h3>

            <div className="mb-3">
                <Tooltip text="Load a predefined kernel configuration.">
                    <label htmlFor="kernel-preset-select" className="text-xs text-cyan-400/70 tracking-widest uppercase cursor-help">
                        Load Preset
                    </label>
                </Tooltip>
                <select
                    id="kernel-preset-select"
                    value={currentPresetName}
                    onChange={(e) => {
                        const selectedPreset = KERNEL_PRESETS.find(p => p.name === e.target.value);
                        if (selectedPreset) {
                            const newGrid = selectedPreset.grid.map(row => [...row]);
                            onLoadPreset(newGrid);
                        }
                    }}
                    disabled={isDisabled}
                    className="mt-1 bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 transition-colors duration-200 disabled:opacity-50"
                    aria-label="Load kernel preset"
                >
                    {currentPresetName === 'custom' && <option value="custom" disabled>Custom</option>}
                    {KERNEL_PRESETS.map(preset => (
                        <option key={preset.name} value={preset.name}>{preset.name}</option>
                    ))}
                </select>
            </div>

            <div className={`grid grid-cols-3 gap-2 transition-opacity ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {coreGrid.map((row, i) =>
                    row.map((cell, j) => {
                        const bgColorClass = GATE_BG_COLORS[cell as keyof typeof GATE_BG_COLORS] || 'bg-slate-800 border-slate-600';
                        return (
                            <Tooltip key={`${i}-${j}`} text={GATE_DESCRIPTIONS[cell as keyof typeof GATE_DESCRIPTIONS]}>
                                <select
                                    value={cell}
                                    onChange={(e) => onGridChange(i, j, parseInt(e.target.value))}
                                    disabled={isDisabled}
                                    className={`border text-white text-xs rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 appearance-none text-center transition-colors duration-200 ${bgColorClass}`}
                                    aria-label={`Kernel cell ${i},${j}`}
                                >
                                    {Object.entries(GATE_NAMES).map(([key, name]) => (
                                        <option key={key} value={key} className="bg-slate-900">{name}</option>
                                    ))}
                                </select>
                            </Tooltip>
                        )
                    })
                )}
            </div>
             <Tooltip text="Resets the kernel to its default configuration (Standard preset)">
                <button
                    onClick={onReset}
                    disabled={isDisabled}
                    className="mt-4 w-full relative px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 border border-transparent disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-px active:translate-y-0 text-gray-300 bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500 focus:ring-gray-500"
                >
                    RESET KERNEL
                </button>
            </Tooltip>
        </div>
    );
};