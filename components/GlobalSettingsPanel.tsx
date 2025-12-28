
import React from 'react';
import type { GlobalSettings, PhysicsModel } from '../types';
import { Tooltip } from './Tooltip';

interface GlobalSettingsPanelProps {
    settings: GlobalSettings;
    onSettingsChange: (setting: keyof GlobalSettings, value: number) => void;
    isDisabled: boolean;
    physicsModel: PhysicsModel;
    onPhysicsModelChange: (model: PhysicsModel) => void;
}

export const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ settings, onSettingsChange, isDisabled, physicsModel, onPhysicsModelChange }) => {
    return (
        <div className="component-panel p-5 rounded-sm w-full bg-slate-900/40">
            <div className="flex items-center justify-between mb-6">
                <span className="hud-label text-cyan-400">GLOBAL_CONFIG</span>
                <span className="font-mono text-[8px] text-slate-600">ID: P-042</span>
            </div>
            
            <div className={`flex flex-col gap-6 transition-opacity ${isDisabled ? 'opacity-30' : ''}`}>
                
                 <div className="flex flex-col gap-2">
                    <Tooltip text="Governing Phase Laws">
                        <label className="hud-label opacity-60">Physics Model</label>
                    </Tooltip>
                    <select 
                        value={physicsModel}
                        onChange={(e) => onPhysicsModelChange(e.target.value as PhysicsModel)}
                        disabled={isDisabled}
                        className="bg-slate-950 border border-slate-800 text-cyan-300 text-[9px] font-orbitron font-bold tracking-widest rounded-sm focus:border-cyan-500 block w-full p-2.5 disabled:opacity-20 appearance-none cursor-pointer"
                    >
                        <option value="standard">STANDARD_REFRACTION</option>
                        <option value="lagrangian">LAGRANGIAN_ENERGY</option>
                        <option value="wave_dynamics">WAVE_INTERFERENCE</option>
                    </select>
                </div>
                
                <div className="flex flex-col gap-2">
                    <Tooltip text="Temporal Recursive Factor">
                        <label className="hud-label opacity-60">Memory Depth</label>
                    </Tooltip>
                    <select 
                        value={settings.recurrenceDepth}
                        onChange={(e) => onSettingsChange('recurrenceDepth', parseInt(e.target.value, 10))}
                        disabled={isDisabled}
                        className="bg-slate-950 border border-slate-800 text-cyan-300 text-[9px] font-orbitron font-bold tracking-widest rounded-sm focus:border-cyan-500 block w-full p-2.5 disabled:opacity-20 appearance-none cursor-pointer"
                    >
                        <option value="1">L1: ITERATIVE</option>
                        <option value="2">L2: RECURSIVE</option>
                    </select>
                </div>

                <div className="flex flex-col gap-3">
                    <Tooltip text="Inter-gate photon density">
                        <div className="flex justify-between items-end">
                            <label className="hud-label opacity-60">Photon Density</label>
                            <span className="font-orbitron font-black text-[10px] text-cyan-400">{(settings.particleDensity * 100).toFixed(0)}%</span>
                        </div>
                    </Tooltip>
                    <input 
                        type="range" 
                        min="0" max="0.2" step="0.01" 
                        value={settings.particleDensity}
                        onChange={(e) => onSettingsChange('particleDensity', parseFloat(e.target.value))}
                        disabled={isDisabled}
                        className="w-full"
                    />
                </div>

                <div className="flex flex-col gap-3">
                     <Tooltip text="Lattice emission amplitude">
                        <div className="flex justify-between items-end">
                            <label className="hud-label opacity-60">Bloom Intensity</label>
                            <span className="font-orbitron font-black text-[10px] text-cyan-400">{(settings.glowIntensity * 100).toFixed(0)}%</span>
                        </div>
                    </Tooltip>
                    <input 
                        type="range" 
                        min="0" max="1.5" step="0.1" 
                        value={settings.glowIntensity}
                        onChange={(e) => onSettingsChange('glowIntensity', parseFloat(e.target.value))}
                        disabled={isDisabled}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};
