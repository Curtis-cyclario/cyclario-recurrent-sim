
import React from 'react';
import { COLORS, REFRACTORY_COLORS, INACTIVE_COLORS, GATE_NAMES } from '../constants';

const GateInfo: React.FC<{ gateKey: number }> = ({ gateKey }) => (
  <div className="group flex flex-col items-center justify-center p-3 border border-slate-800/50 bg-slate-950/30 hover:border-slate-600 transition-colors rounded-sm">
      <h4 className="font-orbitron font-black text-[7px] mb-2 tracking-widest" style={{color: COLORS[gateKey]}}>{GATE_NAMES[gateKey]}</h4>
      <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-white/10 rounded-sm" style={{backgroundColor: COLORS[gateKey], boxShadow: `0 0 10px ${COLORS[gateKey]}50`}} title="Active State"></div>
          <div className="w-3 h-3 border border-white/10 rounded-sm" style={{backgroundColor: REFRACTORY_COLORS[gateKey]}} title="Transition State"></div>
          <div className="w-3 h-3 border border-white/10 rounded-sm bg-slate-900" title="Null State"></div>
      </div>
  </div>
);

export const Legend: React.FC = () => {
  return (
    <div className="component-panel p-5 rounded-sm w-full bg-slate-900/40">
      <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-3 bg-cyan-500 shadow-[0_0_8px_#22d3ee]"></div>
          <h3 className="hud-label text-cyan-400">LOGIC_IDENTIFIERS</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.keys(GATE_NAMES).map(keyStr => {
          const key = parseInt(keyStr);
          return <GateInfo key={key} gateKey={key} />;
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between">
          <span className="hud-label text-[6px] opacity-40">REF: ISO-GATE-V4</span>
          <span className="hud-label text-[6px] opacity-40">CHIP: B-TIEL</span>
      </div>
    </div>
  );
};
