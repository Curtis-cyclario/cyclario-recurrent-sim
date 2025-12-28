
import React, { useState, useMemo } from 'react';
import type { MetricsData } from '../types';
import { FrequencyDomainScope } from './FrequencyDomainScope';
import { Sparkline } from './Sparkline';
import { Tooltip } from './Tooltip';
import { calculateFFT, padSignal } from '../utils/fft';

interface MetricsProps {
  metrics: MetricsData;
  history: MetricsData[];
}

const HISTORY_LENGTH = 128;

const MetricItem: React.FC<{
    title: string; 
    value: string; 
    history: number[]; 
    color: string;
    mode: 'TIME' | 'FREQ';
    unit?: string;
}> = ({ title, value, history, color, mode, unit }) => (
    <div className="flex flex-col items-center justify-between h-full p-4 rounded-sm bg-slate-950/20 border border-transparent hover:border-slate-800/80 transition-all group">
      <div className="text-center w-full">
        <p className="hud-label opacity-60 mb-2 group-hover:opacity-100 transition-opacity">{title}</p>
        <div className="flex items-baseline justify-center gap-1.5 mb-3">
            <span className="font-orbitron text-3xl font-black tracking-tighter text-glow" style={{color}}>
                {value}
            </span>
            {unit && <span className="text-[8px] font-orbitron font-black text-slate-600 uppercase">{unit}</span>}
        </div>
      </div>
      <div className="w-full h-10 flex items-end justify-center opacity-60 group-hover:opacity-100 transition-opacity">
        {mode === 'FREQ' ? (
            <FrequencyDomainScope data={history} color={color} width={100} height={32} />
        ) : (
            <Sparkline data={history} color={color} width={100} height={32} />
        )}
      </div>
    </div>
);

export const Metrics: React.FC<MetricsProps> = ({ metrics, history }) => {
  const [viewMode, setViewMode] = useState<'TIME' | 'FREQ'>('TIME');

  const energyHistory = useMemo(() => history.map(h => h.energy).slice(-HISTORY_LENGTH), [history]);
  const deltaSwastikaHistory = useMemo(() => history.map(h => h.delta_swastika).slice(-HISTORY_LENGTH), [history]);
  const latencyHistory = useMemo(() => history.map(h => h.latency).slice(-HISTORY_LENGTH), [history]);
  const thermalLoadHistory = useMemo(() => history.map(h => h.thermalLoad).slice(-HISTORY_LENGTH), [history]);
  
  const spectralInsight = useMemo(() => {
    if (viewMode !== 'FREQ' || energyHistory.length < 16) return null;
    const padded = padSignal(energyHistory);
    const fft = calculateFFT(padded);
    if (!fft || fft.length < 2) return null;

    let maxMag = 0;
    let maxIdx = 1;
    for (let i = 1; i < fft.length; i++) {
        if (fft[i] > maxMag) { maxMag = fft[i]; maxIdx = i; }
    }

    const relativeFreq = maxIdx / fft.length;
    if (relativeFreq < 0.1) return { label: "MACRO_COHERENCE", desc: "SYSTEM EXHIBITS RHYTHMIC MACRO-STATE SYNCHRONIZATION." };
    if (relativeFreq > 0.4) return { label: "SPECTRAL_NOISE", desc: "HIGH-FREQ JITTER DETECTED. POSSIBLE GATE INSTABILITY." };
    return { label: "RESONANT_FLUX", desc: "BALANCED SIGNAL PROPAGATION THROUGH TOROIDAL MANIFOLD." };
  }, [viewMode, energyHistory]);

  return (
    <div className="component-panel w-full p-4 rounded-sm flex flex-col gap-4 relative overflow-hidden bg-slate-900/20">
        <div className="absolute top-3 right-4 z-10 flex gap-1">
             <button 
                onClick={() => setViewMode(m => m === 'TIME' ? 'FREQ' : 'TIME')} 
                className={`px-3 py-1 text-[8px] font-orbitron font-black border transition-all ${viewMode === 'FREQ' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
            >
                {viewMode === 'TIME' ? "TIME_DOM" : "FREQ_DOM"}
            </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
            <MetricItem title="Protection" value={metrics.delta_swastika.toFixed(2)} history={deltaSwastikaHistory} color="#f97316" mode={viewMode} unit="Δs" />
            <MetricItem title="Latency" value={Math.round(metrics.latency).toString()} history={latencyHistory} color="#22d3ee" mode={viewMode} unit="ms" />
            <MetricItem title="Therm_Load" value={`${(metrics.thermalLoad * 100).toFixed(1)}`} history={thermalLoadHistory} color="#fbbf24" mode={viewMode} unit="%" />
        </div>

        {viewMode === 'FREQ' && spectralInsight && (
            <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-sm fade-in-component">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
                    <span className="hud-label text-emerald-400">ANALYSIS_LOG</span>
                </div>
                <h5 className="text-[12px] font-orbitron font-black text-white tracking-widest uppercase mb-1">{spectralInsight.label}</h5>
                <p className="text-[9px] text-emerald-500/60 font-mono leading-tight tracking-wide">{spectralInsight.desc}</p>
            </div>
        )}
    </div>
  );
};
