
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
            className={`relative w-full h-full rounded-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500
                ${isActive ? 'bg-cyan-500/30 shadow-md shadow-cyan-500/40' : 'bg-slate-800/50 hover:bg-slate-700/50'}
                ${isDisabled ? 'cursor-not-allowed' : ''}`}
        >
            <div className={`absolute inset-0 border rounded-sm transition-colors ${isActive ? 'border-cyan-400' : 'border-slate-700/50'}`} />
            <span className={`font-mono text-xs transition-colors ${isActive ? 'text-cyan-300 text-glow' : 'text-gray-500'}`}>{label}</span>
        </button>
    </Tooltip>
);

export const InterconnectMatrix: React.FC<InterconnectMatrixProps> = ({ channels, onToggle, isDisabled }) => {
    const channelIndices = INTERCONNECT_CHANNELS;

    return (
        <div className="component-panel p-4 rounded-lg w-full">
            <h3 className="text-lg font-orbitron font-bold text-cyan-300 mb-3 text-center tracking-wider">
                INTERCONNECTS
            </h3>
            <div className={`grid grid-cols-4 grid-rows-4 gap-2 aspect-square transition-opacity ${isDisabled ? 'opacity-50' : ''}`}>
                {/* Corner placeholder */}
                <div />
                
                {/* Column Toggles */}
                {channelIndices.map((channel, index) => (
                    <div key={`col-${channel}`} className="flex items-center justify-center">
                        <ToggleButton
                            isActive={channels.cols[index]}
                            onClick={() => onToggle('cols', index)}
                            label={`C${channel}`}
                            title={`Toggle vertical interconnect for column ${channel}`}
                            isDisabled={isDisabled}
                        />
                    </div>
                ))}
                
                {/* Row Toggles and grid */}
                {channelIndices.map((rowChannel, rowIndex) => (
                    <React.Fragment key={`row-${rowChannel}`}>
                        <div className="flex items-center justify-center">
                            <ToggleButton
                                isActive={channels.rows[rowIndex]}
                                onClick={() => onToggle('rows', rowIndex)}
                                label={`R${rowChannel}`}
                                title={`Toggle horizontal interconnect for row ${rowChannel}`}
                                isDisabled={isDisabled}
                            />
                        </div>
                        {/* Grid cells */}
                        {channelIndices.map((_colChannel, colIndex) => {
                            const isRowActive = channels.rows[rowIndex];
                            const isColActive = channels.cols[colIndex];
                            let classNames = 'w-full h-full rounded-sm transition-all duration-200 border border-slate-700/50';
                            
                            if (isRowActive && isColActive) {
                                classNames += ' bg-fuchsia-500/40 shadow-lg shadow-fuchsia-500/50';
                            } else if (isRowActive) {
                                classNames += ' bg-pink-500/30 shadow-sm shadow-pink-500/40';
                            } else if (isColActive) {
                                classNames += ' bg-cyan-500/30 shadow-sm shadow-cyan-500/40';
                            } else {
                                classNames += ' bg-slate-900/50';
                            }

                            return (
                                <div key={`${rowChannel}-${_colChannel}`} className={classNames}></div>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
                Activate channels to enable long-range optical connections.
            </p>
        </div>
    );
};
