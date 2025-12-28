
import React from 'react';
import { INTERCONNECT_CHANNELS } from '../constants';
import { Tooltip } from './Tooltip';

interface InterconnectMatrixProps {
    channels: {
        rows: boolean[];
        cols: boolean[];
    };
    onToggle: (type: 'rows' | 'cols', index: number) => void;
    isDisabled: boolean;
}

const ToggleButton: React.FC<{ isActive: boolean; onClick: () => void; label: string; title: string; isDisabled: boolean; }> = ({ isActive, onClick, label, title, isDisabled }) => (
    <Tooltip text={title} className="w-full h-full">
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`relative w-full h-full rounded-sm transition-all duration-300 focus:outline-none 
                ${isActive ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}
                ${isDisabled ? 'cursor-not-allowed opacity-20' : 'border'}`}
        >
            <span className={`font-orbitron font-black text-[10px] tracking-tighter transition-colors ${isActive ? 'text-cyan-300 text-glow' : 'text-slate-600'}`}>
                {label}
            </span>
        </button>
    </Tooltip>
);

export const InterconnectMatrix: React.FC<InterconnectMatrixProps> = ({ channels, onToggle, isDisabled }) => {
    const channelIndices = INTERCONNECT_CHANNELS;

    return (
        <div className="component-panel p-6 rounded-sm w-full bg-slate-950/40">
            <div className="flex items-center justify-between mb-6">
                <h3 className="hud-label text-cyan-400">BUS_CONTROLLER</h3>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="font-mono text-[8px] text-emerald-500/80">LINK_UP</span>
                </div>
            </div>
            
            <div className={`grid grid-cols-4 grid-rows-4 gap-2 aspect-square transition-all ${isDisabled ? 'grayscale opacity-30' : ''}`}>
                <div className="border border-slate-800 bg-slate-950 flex items-center justify-center rounded-sm">
                    <div className="w-1 h-1 bg-slate-700"></div>
                </div>
                
                {channelIndices.map((channel, index) => (
                    <div key={`col-${channel}`} className="flex items-center justify-center">
                        <ToggleButton
                            isActive={channels.cols[index]}
                            onClick={() => onToggle('cols', index)}
                            label={`C${channel}`}
                            title={`Toggle Optical Column ${channel}`}
                            isDisabled={isDisabled}
                        />
                    </div>
                ))}
                
                {channelIndices.map((rowChannel, rowIndex) => (
                    <React.Fragment key={`row-${rowChannel}`}>
                        <div className="flex items-center justify-center">
                            <ToggleButton
                                isActive={channels.rows[rowIndex]}
                                onClick={() => onToggle('rows', rowIndex)}
                                label={`R${rowChannel}`}
                                title={`Toggle Optical Row ${rowChannel}`}
                                isDisabled={isDisabled}
                            />
                        </div>
                        {channelIndices.map((_colChannel, colIndex) => {
                            const isRowActive = channels.rows[rowIndex];
                            const isColActive = channels.cols[colIndex];
                            let classNames = 'w-full h-full transition-all duration-500 border rounded-sm relative';
                            
                            if (isRowActive && isColActive) {
                                classNames += ' bg-fuchsia-600/40 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.5)]';
                            } else if (isRowActive) {
                                classNames += ' bg-indigo-500/15 border-indigo-500/40';
                            } else if (isColActive) {
                                classNames += ' bg-cyan-500/15 border-cyan-500/40';
                            } else {
                                classNames += ' bg-slate-900 border-slate-900/50';
                            }

                            return (
                                <div key={`${rowChannel}-${_colChannel}`} className={classNames}>
                                    {(isRowActive && isColActive) && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                </div>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between">
                <span className="hud-label !text-[6px] opacity-30 tracking-[0.4em]">BRIDGE: ACTIVE</span>
                <span className="hud-label !text-[6px] opacity-30 tracking-[0.4em]">PIC_ID: BT-901</span>
            </div>
        </div>
    );
};
