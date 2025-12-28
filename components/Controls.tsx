
import React, { useState } from 'react';
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
  isRecording: boolean;
  onToggleRecording: () => void;
  isPlaybackMode: boolean;
  simulationHistory: { lattice: Lattice3D; prevLattice: Lattice3D; metrics: MetricsData; }[];
  playbackIndex: number;
  onScrub: (index: number) => void;
  onExitPlayback: () => void;
}

const PlayIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5V19L19 12L8 5Z" /></svg>;
const StopIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" /></svg>;
const StepIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4V20L13 12L5 4ZM17 4H19V20H17V4Z" /></svg>;
const ResetIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3" strokeLinecap="round"/><path d="M21 3V7H17" strokeLinecap="round"/></svg>;
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'info' | 'neutral';
  active?: boolean;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ onClick, disabled, label, icon, variant = 'neutral', active = false, className = '' }) => {
    const variants = {
        primary: active ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[inset_0_0_15px_rgba(34,211,238,0.3)]" : "text-cyan-500 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-400/5",
        danger: active ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-[inset_0_0_15px_rgba(244,63,94,0.3)]" : "text-rose-500 border-rose-500/30 hover:border-rose-400 hover:bg-rose-400/5",
        warning: active ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[inset_0_0_15px_rgba(245,158,11,0.3)]" : "text-amber-500 border-amber-500/30 hover:border-amber-400 hover:bg-amber-400/5",
        info: active ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-[inset_0_0_15px_rgba(129,140,248,0.3)]" : "text-indigo-400 border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-400/5",
        neutral: active ? "bg-slate-700/40 border-slate-400 text-slate-200" : "text-slate-500 border-slate-800 hover:border-slate-500 hover:text-slate-300 hover:bg-slate-400/5"
    };

    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`
                px-3 py-2 border rounded-sm font-orbitron font-extrabold text-[9px] tracking-wider transition-all 
                disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2
                ${variants[variant]} ${className}
            `}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {label && <span className="uppercase">{label}</span>}
        </button>
    );
};

const HeaderGroup: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, isOpen, onToggle, children }) => (
    <div className="flex flex-col gap-3 group/header">
        <button onClick={onToggle} className="flex items-center justify-between w-full border-b border-slate-800/80 pb-1.5 px-0.5 transition-colors hover:border-slate-600">
            <span className="hud-label opacity-60 group-hover/header:opacity-100 group-hover/header:text-cyan-400 transition-all">{title}</span>
            <ChevronIcon open={isOpen} />
        </button>
        {isOpen && <div className="flex flex-col gap-4 py-2 animate-fade-in-down">{children}</div>}
    </div>
);

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
      execution: true,
      timing: true,
      topology: false,
      instrumentation: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
      setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isPlaybackMode) return <PlaybackControls historyLength={simulationHistory.length} playbackIndex={playbackIndex} onScrub={onScrub} onExitPlayback={onExitPlayback} />;

  return (
    <>
      <SavePatternModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onSavePattern} />
      <div className="component-panel w-full p-6 flex flex-col gap-6 bg-slate-950/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border-slate-800">
        
        <HeaderGroup title="Coherence Loop" isOpen={openSections.execution} onToggle={() => toggleSection('execution')}>
            <div className="grid grid-cols-2 gap-2">
                <ControlButton onClick={onStart} disabled={isRunning} label="Execute" icon={<PlayIcon />} variant="primary" active={isRunning} />
                <ControlButton onClick={onStop} disabled={!isRunning} label="Terminate" icon={<StopIcon />} variant="danger" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <ControlButton onClick={onStep} disabled={isRunning} label="Step Phase" icon={<StepIcon />} variant="info" />
                <ControlButton onClick={onReset} label="Re-Init" icon={<ResetIcon />} variant="warning" />
            </div>
            <div className="flex gap-2">
                <ControlButton onClick={onClear} disabled={isRunning} label="Purge Lattice" className="flex-1" />
                <ControlButton onClick={onOpenGenerator} disabled={isRunning} label="AI Synthesis" variant="info" className="flex-1" />
            </div>
        </HeaderGroup>

        <HeaderGroup title="Refractory Sync" isOpen={openSections.timing} onToggle={() => toggleSection('timing')}>
            <div className="p-4 bg-slate-900/40 border border-slate-800/50 rounded-sm">
                <div className="flex justify-between items-baseline mb-4">
                    <span className="hud-label !text-[7px]">Clock Interval</span>
                    <span className="font-orbitron font-black text-cyan-400 text-sm tracking-tighter">{Math.round(effectiveDelay)} <small className="text-[8px] text-slate-500 font-mono">MS</small></span>
                </div>
                <input type="range" min="0" max="1000" step="10" value={delay} onChange={onDelayChange} className="w-full accent-cyan-500" />
                <div className="grid grid-cols-4 gap-1 mt-4">
                    {[{l:'S',d:800},{l:'M',d:200},{l:'F',d:50},{l:'MAX',d:0}].map((p, i) => (
                        <ControlButton key={i} label={p.l} onClick={() => onSetDelay(p.d)} active={delay === p.d} className="!py-1" />
                    ))}
                </div>
            </div>
        </HeaderGroup>

        <HeaderGroup title="Topological Presets" isOpen={openSections.topology} onToggle={() => toggleSection('topology')}>
            <div className="flex flex-col gap-2">
                <select 
                    value={selectedPatternId} onChange={(e) => onLoadPattern(e.target.value)} disabled={isRunning} 
                    className="bg-slate-950 border border-slate-800 text-cyan-300 text-[10px] font-orbitron font-bold rounded-sm p-3 focus:border-cyan-500 outline-none appearance-none cursor-pointer"
                >
                    <option value="default-start">DEFAULT_INITIAL_STATE</option>
                    {patterns.map(p => (<option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>))}
                </select>
                <div className="grid grid-cols-3 gap-1">
                    <ControlButton onClick={() => setIsModalOpen(true)} disabled={isRunning} label="Capture" />
                    <ControlButton onClick={() => onUpdatePattern(selectedPatternId)} disabled={isRunning || !patterns.find(p=>p.id===selectedPatternId && !p.isDefault)} label="Update" />
                    <ControlButton onClick={() => onDeletePattern(selectedPatternId)} disabled={isRunning || !patterns.find(p=>p.id===selectedPatternId && !p.isDefault)} label="Drop" variant="danger" />
                </div>
            </div>
        </HeaderGroup>

        <HeaderGroup title="Audio & HUD Config" isOpen={openSections.instrumentation} onToggle={() => toggleSection('instrumentation')}>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <ControlButton onClick={onToggleBorders} label="Draw Mesh" variant="neutral" active={showBorders} />
                <ControlButton onClick={onToggleRecording} disabled={isRunning} label="Trace Loop" variant="danger" active={isRecording} />
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-800/50 rounded-sm flex flex-col gap-4">
                <div>
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="hud-label !text-[7px]">Feedback Volume</span>
                        <span className="font-mono text-[9px] text-cyan-500/60">{Math.round(volume * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={onVolumeChange} className="w-full accent-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="hud-label !text-[6px] opacity-50">Signal Mod</label>
                        <select value={waveform} onChange={onWaveformChange} className="bg-slate-950 border border-slate-800 text-[9px] font-orbitron text-slate-400 p-2 rounded-sm outline-none">
                            <option value="sine">SINE</option>
                            <option value="square">SQUARE</option>
                            <option value="sawtooth">SAW</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="hud-label !text-[6px] opacity-50">Telemetry Src</label>
                        <select value={audioSource} onChange={onAudioSourceChange} className="bg-slate-950 border border-slate-800 text-[9px] font-orbitron text-slate-400 p-2 rounded-sm outline-none">
                            <option value="energy">ENERGY</option>
                            <option value="thermalLoad">THERMAL</option>
                            <option value="delta_swastika">DELTA</option>
                        </select>
                    </div>
                </div>
            </div>
        </HeaderGroup>

      </div>
    </>
  );
};
