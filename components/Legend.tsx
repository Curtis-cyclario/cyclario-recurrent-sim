
import React from 'react';
import { COLORS, REFRACTORY_COLORS, INACTIVE_COLORS, GATE_NAMES } from '../constants';

const GateInfo: React.FC<{ gateKey: number }> = ({ gateKey }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded" style={{backgroundColor: INACTIVE_COLORS[gateKey]}}>
      <h4 className="font-orbitron text-sm font-bold tracking-widest" style={{color: COLORS[gateKey], textShadow: `0 0 5px ${COLORS[gateKey]}`}}>{GATE_NAMES[gateKey]}</h4>
      <div className="flex items-center space-x-2 mt-2">
          <div className="w-3 h-3 rounded-sm" style={{backgroundColor: COLORS[gateKey]}} title="Active"></div>
          <div className="w-3 h-3 rounded-sm" style={{backgroundColor: REFRACTORY_COLORS[gateKey]}} title="Refractory"></div>
          <div className="w-3 h-3 rounded-sm" style={{backgroundColor: INACTIVE_COLORS[gateKey], border: '1px solid #4a5568'}} title="Inactive"></div>
      </div>
  </div>
);

export const Legend: React.FC = () => {
  return (
    <div className="component-panel p-4 rounded-lg w-full">
      <h3 className="text-lg font-orbitron font-bold text-cyan-300 mb-3 text-center tracking-wider">GATE LEGEND</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.keys(GATE_NAMES).map(keyStr => {
          const key = parseInt(keyStr);
          return <GateInfo key={key} gateKey={key} />;
        })}
      </div>
    </div>
  );
};