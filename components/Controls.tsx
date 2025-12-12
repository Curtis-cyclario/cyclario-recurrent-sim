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

const Button: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string; }> = ({ onClick, disabled = false, children, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 border border-transparent overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-px active:translate-y-0 ${className}`}
  >
    <span className="relative z-10">{children}</span>
  </button>
);

const AIGenerateIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 2L6 5L9 6L6 7L5 10L4 7L1 6L4 5L5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 15L18 18L15 19L18 20L19 23L20 20L23 19L20 18L19 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
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
    { name: 'Medium', delay: 200 },
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
        {/* Simulation Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Tooltip text="Starts the simulation"><Button onClick={onStart} disabled={isRunning} className="text-green-300 bg-green-900/50 border-green-500/50 hover:bg-green-800/50 hover:border-green-400 focus:ring-green-400">START</Button></Tooltip>
          <Tooltip text="Stops the simulation"><Button onClick={onStop} disabled={!isRunning} className="text-red-300 bg-red-900/50 border-red-500/50 hover:bg-red-800/50 hover:border-red-400 focus:ring-red-400">STOP</Button></Tooltip>
          <Tooltip text="Advance the simulation by one step"><Button onClick={onStep} disabled={isRunning} className="text-indigo-300 bg-indigo-900/50 border-indigo-500/50 hover:bg-indigo-800/50 hover:border-indigo-400 focus:ring-indigo-400">STEP</Button></Tooltip>
          <Tooltip text="Resets to the default starting pattern"><Button onClick={onReset} className="text-amber-300 bg-amber-900/50 border-amber-600/50 hover:bg-amber-800/50 hover:border-amber-500 focus:ring-amber-500">RESET</Button></Tooltip>
        </div>
        <Tooltip text="Clears the lattice, setting all cells to inactive"><Button onClick={onClear} disabled={isRunning} className="text-gray-300 bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500 focus:ring-gray-500 w-full">CLEAR LATTICE</Button></Tooltip>

        <div className="w-full h-px bg-slate-700/70 my-1"></div>
        
        {/* Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="pattern-select" className="text-xs text-cyan-400/70 tracking-widest uppercase">Pattern Preset</label>
                <div className="flex items-center gap-2">
                    <Tooltip text="Generate with AI">
                        <button
                          onClick={onOpenGenerator}
                          disabled={isRunning}
                          className="text-cyan-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Generate pattern or kernel with AI"
                        >
                            <AIGenerateIcon />
                        </button>
                    </Tooltip>
                    <div className="relative" ref={menuRef}>
                        <Tooltip text="Pattern options">
                            <button 
                              onClick={() => setIsMenuOpen(p => !p)} 
                              disabled={isRunning} 
                              className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-haspopup="true"
                              aria-expanded={isMenuOpen}
                              aria-label="Pattern options"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                            </button>
                        </Tooltip>
                      {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 component-panel rounded-md shadow-lg z-10 fade-in-component" style={{animationDuration: '0.15s'}}>
                          <div className="py-1">
                            <button onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/60">Save current as new...</button>
                            <button onClick={handleUpdate} disabled={!canUpdateOrDelete} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/60 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-transparent">Overwrite selected</button>
                            <button onClick={handleDelete} disabled={!canUpdateOrDelete} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/60 disabled:text-red-400/40 disabled:cursor-not-allowed disabled:hover:bg-transparent">Delete selected</button>
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              </div>
              <Tooltip text="Load a pre-defined or saved cell pattern">
                <select id="pattern-select" value={selectedPatternId} onChange={(e) => onLoadPattern(e.target.value)} disabled={isRunning} className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="" disabled>Select...</option>
                    <option value="default-start">Default Start</option>
                    <optgroup label="Default Patterns">
                    {patterns.filter(p => p.isDefault).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </optgroup>
                    {patterns.filter(p => !p.isDefault).length > 0 && (
                    <optgroup label="My Patterns">
                        {patterns.filter(p => !p.isDefault).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </optgroup>
                    )}
                </select>
              </Tooltip>
          </div>
          <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <label htmlFor="delay-input" className="text-xs text-cyan-400/70 tracking-widest uppercase">Speed</label>
                <span className="text-sm font-orbitron text-cyan-300">{Math.round(effectiveDelay)} ms</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {speedPresets.map(({ name, delay: presetDelay }) => (
                  <Tooltip text={`${name} speed (${presetDelay}ms)`} key={name}>
                    <button
                      onClick={() => onSetDelay(presetDelay)}
                      disabled={isRunning}
                      className={`px-2 py-1 text-xs font-bold rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 border disabled:opacity-40 disabled:cursor-not-allowed
                        ${delay === presetDelay
                          ? 'bg-cyan-900/50 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-800/50 border-slate-600/50 text-gray-300 hover:bg-slate-700/50'
                        }
                      `}
                    >
                      {name.toUpperCase()}
                    </button>
                  </Tooltip>
                ))}
              </div>
              <Tooltip text="Controls the delay between simulation steps (in milliseconds)">
                <input id="delay-input" type="range" value={delay} onChange={onDelayChange} disabled={isRunning} min="0" max="1000" step="10" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Simulation speed in milliseconds"/>
              </Tooltip>
          </div>
        </div>
        
        <div className="w-full h-px bg-slate-700/70 my-1"></div>

        {/* Display Options */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
              <label htmlFor="border-toggle" className="text-sm text-gray-300">Show Cell Borders</label>
              <Tooltip text={showBorders ? "Hide cell borders" : "Show cell borders"}>
                <button
                    id="border-toggle"
                    onClick={onToggleBorders}
                    role="switch"
                    aria-checked={showBorders}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${showBorders ? 'bg-cyan-600' : 'bg-slate-700'}`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${showBorders ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
              </Tooltip>
          </div>
           <div className="flex justify-between items-center">
              <label htmlFor="record-toggle" className="text-sm text-gray-300">Record Run</label>
              <Tooltip text={isRecording ? "Stop recording on next 'STOP'" : "Record simulation steps when running"}>
              <button
                  id="record-toggle"
                  onClick={onToggleRecording}
                  disabled={isRunning}
                  role="switch"
                  aria-checked={isRecording}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:opacity-50 ${isRecording ? 'bg-red-600' : 'bg-slate-700'}`}
              >
                  <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isRecording ? 'translate-x-6' : 'translate-x-1'}`}
                  />
              </button>
              </Tooltip>
          </div>
        </div>

        <div className="w-full h-px bg-slate-700/70 my-1"></div>

        {/* Audio */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="audio-source-select" className="text-xs text-cyan-400/70 tracking-widest uppercase">Audio Source</label>
            <Tooltip text="Selects which system metric drives the audio feedback.">
                <select id="audio-source-select" value={audioSource} onChange={onAudioSourceChange} className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 transition-colors duration-200">
                    <option value="energy">Energy</option>
                    <option value="thermalLoad">Thermal Load</option>
                    <option value="delta_swastika">Protection (Δs)</option>
                </select>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="audio-profile-select" className="text-xs text-cyan-400/70 tracking-widest uppercase">Audio Profile</label>
            <Tooltip text="Changes the type of sound generated by the audio feedback system.">
                <select id="audio-profile-select" value={audioProfile} onChange={onAudioProfileChange} className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 transition-colors duration-200">
                    <option value="synth_blip">Synth Blip</option>
                    <option value="thermal_noise">Thermal Noise</option>
                </select>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="waveform-select" className="text-xs text-cyan-400/70 tracking-widest uppercase">Waveform</label>
            <Tooltip text="Changes the oscillator waveform for the 'Synth Blip' profile.">
                <select id="waveform-select" value={waveform} onChange={onWaveformChange} disabled={audioProfile !== 'synth_blip'} className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
            </Tooltip>
          </div>
           <div className="flex flex-col gap-2">
            <label htmlFor="volume-slider" className="text-xs text-cyan-400/70 tracking-widest uppercase">Master Volume</label>
            <Tooltip text="Adjusts the master audio volume">
                <input id="volume-slider" type="range" min="0" max="1" step="0.01" value={volume} onChange={onVolumeChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer my-auto" aria-label="Master volume control"/>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
};