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
        <div className="component-panel p-4 rounded-lg w-full">
            <h3 className="text-lg font-orbitron font-bold text-cyan-300 mb-4 text-center tracking-wider">
                GLOBAL SETTINGS
            </h3>
            <div className={`flex flex-col gap-4 transition-opacity ${isDisabled ? 'opacity-50' : ''}`}>
                
                 <div className="flex flex-col gap-2">
                    <Tooltip text="Changes the core evaluation formula for the simulation.">
                        <label htmlFor="physics-model" className="text-xs text-cyan-400/70 tracking-widest uppercase cursor-help">Physics Model</label>
                    </Tooltip>
                    <select 
                        id="physics-model" 
                        value={physicsModel}
                        onChange={(e) => onPhysicsModelChange(e.target.value as PhysicsModel)}
                        disabled={isDisabled}
                        className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 transition-colors duration-200 disabled:opacity-50"
                    >
                        <option value="standard">Standard</option>
                        <option value="lagrangian">Lagrangian</option>
                        <option value="wave_dynamics">Wave Dynamics</option>
                    </select>
                </div>
                
                <div className="flex flex-col gap-2">
                    <Tooltip text="Number of previous simulation states that influence the next state. Higher values increase complexity.">
                        <label htmlFor="recurrence-depth" className="text-xs text-cyan-400/70 tracking-widest uppercase cursor-help">Recurrence Depth</label>
                    </Tooltip>
                    <select 
                        id="recurrence-depth" 
                        value={settings.recurrenceDepth}
                        onChange={(e) => onSettingsChange('recurrenceDepth', parseInt(e.target.value, 10))}
                        disabled={isDisabled}
                        className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 transition-colors duration-200 disabled:opacity-50"
                    >
                        <option value="1">1 (Standard)</option>
                        <option value="2">2 (Deep)</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <Tooltip text="Controls the spawn rate of particles visualizing edge communication.">
                        <div className="flex justify-between items-baseline">
                            <label htmlFor="particle-density" className="text-xs text-cyan-400/70 tracking-widest uppercase cursor-help">Particle Density</label>
                            <span className="text-sm font-orbitron text-cyan-300">{settings.particleDensity.toFixed(2)}</span>
                        </div>
                    </Tooltip>
                    <input 
                        id="particle-density" 
                        type="range" 
                        min="0" max="0.2" step="0.01" 
                        value={settings.particleDensity}
                        onChange={(e) => onSettingsChange('particleDensity', parseFloat(e.target.value))}
                        disabled={isDisabled}
                        aria-label="Particle density slider"
                    />
                </div>

                <div className="flex flex-col gap-2">
                     <Tooltip text="Adjusts the bloom effect intensity for active cells.">
                        <div className="flex justify-between items-baseline">
                            <label htmlFor="glow-intensity" className="text-xs text-cyan-400/70 tracking-widest uppercase cursor-help">Glow Intensity</label>
                            <span className="text-sm font-orbitron text-cyan-300">{settings.glowIntensity.toFixed(1)}</span>
                        </div>
                    </Tooltip>
                    <input 
                        id="glow-intensity" 
                        type="range" 
                        min="0" max="1.5" step="0.1" 
                        value={settings.glowIntensity}
                        onChange={(e) => onSettingsChange('glowIntensity', parseFloat(e.target.value))}
                        aria-label="Glow intensity slider"
                    />
                </div>

            </div>
        </div>
    );
};