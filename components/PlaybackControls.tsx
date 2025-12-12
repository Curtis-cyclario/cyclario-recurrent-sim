import React from 'react';
import { Tooltip } from './Tooltip';

interface PlaybackControlsProps {
  historyLength: number;
  playbackIndex: number;
  onScrub: (index: number) => void;
  onExitPlayback: () => void;
}

const ExitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);


export const PlaybackControls: React.FC<PlaybackControlsProps> = ({ historyLength, playbackIndex, onScrub, onExitPlayback }) => {
    return (
        <div className="component-panel w-full p-4 rounded-lg flex flex-col gap-4 fade-in-component">
            <h3 className="text-lg font-orbitron font-bold text-cyan-300 text-center tracking-wider">PLAYBACK MODE</h3>
            <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-gray-400">Step:</span>
                <input
                    type="range"
                    min="0"
                    max={historyLength > 0 ? historyLength - 1 : 0}
                    value={playbackIndex}
                    onChange={(e) => onScrub(parseInt(e.target.value, 10))}
                    className="w-full"
                    aria-label="Simulation history scrubber"
                />
                <span className="text-sm font-orbitron text-cyan-300 w-24 text-center">{playbackIndex + 1} / {historyLength}</span>
            </div>
            <Tooltip text="Exit playback and return to live simulation">
                <button
                    onClick={onExitPlayback}
                    className="w-full relative px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 border border-transparent disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-px active:translate-y-0 text-amber-300 bg-amber-900/50 border-amber-600/50 hover:bg-amber-800/50 hover:border-amber-500 focus:ring-amber-500 flex items-center justify-center gap-2"
                >
                    <ExitIcon />
                    EXIT PLAYBACK
                </button>
            </Tooltip>
        </div>
    );
};