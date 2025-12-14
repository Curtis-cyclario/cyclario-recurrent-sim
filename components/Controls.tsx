
import React, { useState, useRef, useEffect } from 'react';
import type { Waveform, UserPattern, AudioSourceMetric, AudioProfile, MetricsData, Lattice3D } from '../types';
import { SavePatternModal } from './SavePatternModal';
import { Tooltip } from './Tooltip';
import { PlaybackControls } from './PlaybackControls';

interface ControlsProps {
  onStart: () => void;
  onStop: () => void;
  onStep: () => void;
  onReset: () => void;
  onClear: () => void;
  onLoadPattern: (patternId: string) => void;
  isRunning: boolean;
  delay: number;
  effectiveDelay: number;
  onDelayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetDelay: (delay: number) => void;
  patterns: UserPattern[];
  selectedPatternId: string;
  onSavePattern: (name: string) => void;
  onUpdatePattern: (id: string) => void;
  onDeletePattern: (id: string) => void;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  waveform: Waveform;
  onWaveformChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  audioSource: AudioSourceMetric;
  onAudioSourceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  audioProfile: AudioProfile;
  onAudioProfileChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  showBorders: boolean;
  onToggleBorders: () => void;
  onOpenGenerator: () => void;
  // New playback props
  isRecording: boolean;
  onToggleRecording: () => void;
  isPlaybackMode: boolean;
  simulationHistory: { lattice: Lattice3D; prevLattice: Lattice3D; metrics: MetricsData; }[];
  playbackIndex: number;
  onScrub: (index: number) => void;
  onExitPlayback: () => void;
}

// --- Icons ---
const PlayIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5V19L19 12L8 5Z" /></svg>;
const StopIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" /></svg>;
const StepIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4V20L13 12L5 4ZM17 4H19V20H17V4Z" /></svg>;
const ResetIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3" strokeLinecap="round"/><path d="M21 3V7H17" strokeLinecap="round"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6H21" strokeLinecap="round"/><path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" strokeLinecap="round"/><path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6" strokeLinecap="round"/><path d="M10 11V17" strokeLinecap="round"/><path d="M14 11V17" strokeLinecap="round"/></svg>;
const AIGenerateIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /><path d="M5 2L6 5L9 6L6 7L5 10L4 7L1 6L4 5L5 2Z" /><path d="M19 15L18 18L15 19L18 20L19 23L20 20L23 19L20 18L19 15Z" /></svg>;
const MenuIcon = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>;
const GridIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/></svg>;
const RecIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>;

// --- Components ---

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'info' | 'neutral';
  className?: string;
  active?: boolean;
  groupPosition?: 'left' | 'middle' | 'right' | 'single';
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
    onClick, disabled, label, icon, variant = 'neutral', className = '', active = false, groupPosition = 'single'
}) => {
    
    // Technical color maps
    // If active, we boost the intensity
    const colors = {
        primary: active 
            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]" 
            : "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400",
        danger: active
            ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(251,113,133,0.3)]"
            : "text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-400",
        warning: active
            ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
            : "text-amber-400 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-400",
        info: active
            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]"
            : "text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400",
        neutral: active
            ? "bg-slate-700 border-slate-400 text-slate-200"
            : "text-slate-400 border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-400 bg-slate-900/80"
    };

    const activeColor = colors[variant];
    
    // Grouping Border Radius logic
    let radiusClass = "rounded-sm";
    if (groupPosition === 'left') radiusClass = "rounded-l-sm rounded-r-none border-r-0";
    if (groupPosition === 'middle') radiusClass = "rounded-none border-r-0";
    if (groupPosition === 'right') radiusClass = "rounded-r-sm rounded-l-none";

    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`
                relative group flex items-center justify-center gap-2 px-3 py-2
                transition-all duration-200 border
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-800
                ${activeColor}
                ${radiusClass}
                ${className}
            `}
        >
            {/* Tech Corner Markers - Only if single or edges */}
            {!active && (groupPosition === 'single' || groupPosition === 'left') && (
                 <div className="absolute top-0 left-0 w-1 h-1 border-l border-t border-current opacity-40 group-hover:opacity-100 transition-opacity" />
            )}
            {!active && (groupPosition === 'single' || groupPosition === 'right') && (
                 <div className="absolute bottom-0 right-0 w-1 h-1 border-r border-b border-current opacity-40 group-hover:opacity-100 transition-opacity" />
            )}
            
            {icon && <span className={`${label ? '' : 'mx-auto'} ${active ? 'opacity-100' : 'opacity-80 group-hover:scale-110 transition-transform'}`}>{icon}</span>}
            {label && <span className="font-orbitron font-bold text-[10px] tracking-widest uppercase truncate">{label}</span>}
        </button>
    )
};

export const Controls: React.FC<ControlsProps> = (props) => {
  const { 
    onStart, onStop, onStep, onReset, onClear, onLoadPattern, isRunning, 
    delay, effectiveDelay, onDelayChange, onSetDelay, patterns, selectedPatternId, onSavePattern,
    onUpdatePattern, onDeletePattern, volume, onVolumeChange,
    waveform, onWaveformChange, audioSource, onAudioSourceChange,
    audioProfile, onAudioProfileChange, showBorders, onToggleBorders,
    onOpenGenerator, isRecording, onToggleRecording, isPlaybackMode,
    simulationHistory, playbackIndex, onScrub, onExitPlayback
  } = props;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedPattern = patterns.find(p => p.id === selectedPatternId);
  const canUpdateOrDelete = selectedPattern && !selectedPattern.isDefault;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const handleSave = (name: string) => {
    onSavePattern(name);
    setIsModalOpen(false);
  };
  
  const handleUpdate = () => {
    if (canUpdateOrDelete && window.confirm(`Are you sure you want to overwrite "${selectedPattern?.name}"?`)) {
      onUpdatePattern(selectedPatternId);
    }
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    if (canUpdateOrDelete && window.confirm(`Are you sure you want to delete "${selectedPattern?.name}"? This cannot be undone.`)) {
      onDeletePattern(selectedPatternId);
    }
    setIsMenuOpen(false);
  }

  const speedPresets = [
    { name: 'Slow', delay: 800 },
    { name: 'Med', delay: 200 },
    { name: 'Fast', delay: 50 },
    { name: 'Max', delay: 0 },
  ];

  if (isPlaybackMode) {
      return (
        <PlaybackControls 
            historyLength={simulationHistory.length}
            playbackIndex={playbackIndex}
            onScrub={onScrub}
            onExitPlayback={onExitPlayback}
        />
      );
  }

  return (
    <>
      <SavePatternModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      <div className="component-panel w-full p-4 rounded-lg flex flex-col gap-4">
        
        {/* Main Controls Grid */}
        <div className="grid grid-cols-2 gap-2">
             <Tooltip text="Start Simulation">
                <ControlButton 
                    onClick={onStart} 
                    disabled={isRunning} 
                    label="Run" 
                    icon={<PlayIcon />} 
                    variant="primary" 
                    active={isRunning}
                />
            </Tooltip>
            
            <Tooltip text="Stop Simulation">
                <ControlButton 
                    onClick={onStop} 
                    disabled={!isRunning} 
                    label="Stop" 
                    icon={<StopIcon />} 
                    variant="danger" 
                />
            </Tooltip>
            
            <Tooltip text="Step Simulation (Single Frame)">
                <ControlButton 
                    onClick={onStep} 
                    disabled={isRunning} 
                    label="Step" 
                    icon={<StepIcon />} 
                    variant="info" 
                />
            </Tooltip>
            
            <Tooltip text="Reset to Initial State">
                <ControlButton 
                    onClick={onReset} 
                    label="Reset" 
                    icon={<ResetIcon />} 
                    variant="warning" 
                />
            </Tooltip>
        </div>
        
        {/* Secondary Action Bar */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
             <Tooltip text="Clear Entire Lattice">
                <ControlButton 
                    onClick={onClear} 
                    disabled={isRunning} 
                    label="Clear" 
                    icon={<TrashIcon />} 
                    variant="neutral"
                />
            </Tooltip>
             <Tooltip text="Generate with AI">
                <ControlButton 
                    onClick={onOpenGenerator}
                    disabled={isRunning}
                    icon={<AIGenerateIcon />}
                    variant="info"
                    className="w-10 px-0"
                />
            </Tooltip>
            <div className="relative" ref={menuRef}>
                <Tooltip text="Pattern Options">
                    <ControlButton 
                        onClick={() => setIsMenuOpen(p => !p)} 
                        disabled={isRunning} 
                        icon={<MenuIcon />}
                        variant="neutral"
                        active={isMenuOpen}
                        className="w-10 px-0"
                    />
                </Tooltip>
                {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-sm shadow-xl z-20">
                    <div className="py-1">
                    <button onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 font-mono uppercase">Save as New...</button>
                    <button onClick={handleUpdate} disabled={!canUpdateOrDelete} className="block w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 disabled:text-slate-600 font-mono uppercase">Overwrite</button>
                    <button onClick={handleDelete} disabled={!canUpdateOrDelete} className="block w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 disabled:text-rose-900 font-mono uppercase">Delete</button>
                    </div>
                </div>
                )}
            </div>
        </div>

        <div className="w-full h-px bg-slate-800" />
        
        {/* Pattern & Speed Section */}
        <div className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
               <label htmlFor="pattern-select" className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase mb-1">Pattern Configuration</label>
               <select 
                id="pattern-select" 
                value={selectedPatternId} 
                onChange={(e) => onLoadPattern(e.target.value)} 
                disabled={isRunning} 
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 disabled:opacity-50 appearance-none font-mono"
               >
                    <option value="" disabled>Select Preset...</option>
                    <option value="default-start">Default Start</option>
                    <optgroup label="System Presets" className="bg-slate-800 text-slate-400">
                    {patterns.filter(p => p.isDefault).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </optgroup>
                    {patterns.filter(p => !p.isDefault).length > 0 && (
                    <optgroup label="User Presets" className="bg-slate-800 text-cyan-400">
                        {patterns.filter(p => !p.isDefault).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </optgroup>
                    )}
                </select>
          </div>
          
          <div className="flex flex-col gap-1">
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">Simulation Rate</label>
                <span className="text-xs font-mono text-cyan-300">{Math.round(effectiveDelay)} ms</span>
              </div>
              <div className="flex w-full">
                {speedPresets.map(({ name, delay: presetDelay }, index) => {
                    // Determine group position
                    let pos: 'left' | 'middle' | 'right' | 'single' = 'middle';
                    if (index === 0) pos = 'left';
                    if (index === speedPresets.length - 1) pos = 'right';
                    
                    return (
                        <ControlButton 
                            key={name}
                            label={name}
                            onClick={() => onSetDelay(presetDelay)}
                            disabled={isRunning}
                            active={delay === presetDelay}
                            variant="info"
                            className="flex-1"
                            groupPosition={pos}
                        />
                    );
                })}
              </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-800" />

        {/* Unified Toggles */}
        <div className="grid grid-cols-2 gap-2">
             <Tooltip text="Toggle grid overlay on visualization">
                <ControlButton 
                    onClick={onToggleBorders}
                    label="Overlay"
                    icon={<GridIcon />}
                    variant="neutral"
                    active={showBorders}
                />
            </Tooltip>
             <Tooltip text="Record simulation metrics for playback">
                <ControlButton 
                    onClick={onToggleRecording}
                    disabled={isRunning}
                    label="Record"
                    icon={<RecIcon />}
                    variant="danger"
                    active={isRecording}
                />
            </Tooltip>
        </div>

        <div className="w-full h-px bg-slate-800" />

        {/* Audio Controls */}
        <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2 flex flex-col gap-1">
                 <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Master Gain</label>
                 <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={volume} onChange={onVolumeChange} 
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                 />
             </div>
             
             <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Source</label>
                <select value={audioSource} onChange={onAudioSourceChange} className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded-sm p-1.5 focus:border-cyan-500 font-mono">
                    <option value="energy">Energy</option>
                    <option value="thermalLoad">Thermal</option>
                    <option value="delta_swastika">Metric Δs</option>
                </select>
             </div>
             
             <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Profile</label>
                <select value={audioProfile} onChange={onAudioProfileChange} className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded-sm p-1.5 focus:border-cyan-500 font-mono">
                    <option value="synth_blip">Oscillator</option>
                    <option value="thermal_noise">Noise</option>
                </select>
             </div>

             <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Waveform</label>
                <select 
                    value={waveform} 
                    onChange={onWaveformChange} 
                    disabled={audioProfile !== 'synth_blip'}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded-sm p-1.5 focus:border-cyan-500 disabled:opacity-40 font-mono"
                >
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
             </div>
        </div>
      </div>
    </>
  );
};
