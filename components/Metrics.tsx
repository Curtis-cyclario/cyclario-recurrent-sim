
import React, { useState } from 'react';
import type { MetricsData } from '../types';
import { FrequencyDomainScope } from './FrequencyDomainScope';
import { Sparkline } from './Sparkline';
import { Tooltip } from './Tooltip';

interface MetricsProps {
  metrics: MetricsData;
  history: MetricsData[];
}

const HISTORY_LENGTH = 128; // FFT works best with powers of 2

const MetricItem: React.FC<{
    title: string; 
    value: string; 
    history: number[]; 
    color: string;
    mode: 'TIME' | 'FREQ';
}> = ({ title, value, history, color, mode }) => (
    <div className="flex flex-col items-center justify-start text-center h-full relative group">
      <div>
        <p className="text-xs text-cyan-400/70 tracking-widest uppercase">{title}</p>
        <p className="font-orbitron text-2xl lg:text-3xl text-cyan-300 tracking-wider my-1" style={{textShadow: `0 0 5px ${color}`}}>
          {value}
        </p>
      </div>
      <div className="mt-auto w-full h-[40px] flex items-end justify-center">
        {mode === 'FREQ' ? (
            <FrequencyDomainScope data={history} color={color} width={120} height={40} />
        ) : (
            <Sparkline data={history} color={color} width={120} height={40} />
        )}
      </div>
    </div>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const MarkdownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const WaveIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12C2 12 5 2 8 12C11 22 14 2 17 12C20 22 23 12 23 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const BarChartIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20V10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 20V4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20V16" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const Metrics: React.FC<MetricsProps> = ({ metrics, history }) => {
  const [viewMode, setViewMode] = useState<'TIME' | 'FREQ'>('TIME');

  const deltaSwastikaHistory = history.map(h => h.delta_swastika).slice(-HISTORY_LENGTH);
  const latencyHistory = history.map(h => h.latency).slice(-HISTORY_LENGTH);
  const thermalLoadHistory = history.map(h => h.thermalLoad).slice(-HISTORY_LENGTH);
  
  const handleExport = () => {
    if (history.length === 0) return;

    const headers: (keyof MetricsData)[] = ['delta_swastika', 'latency', 'energy', 'thermalLoad'];
    const csvContent = [
        headers.join(','),
        ...history.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `metrics-history-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMarkdownExport = () => {
    if (history.length === 0) return;

    const headers: (keyof MetricsData)[] = ['delta_swastika', 'latency', 'energy', 'thermalLoad'];
    const headerLabels = ['Protection (Δs)', 'Latency (ms)', 'Energy', 'Thermal Load'];
    
    // Markdown Table Construction
    const headerRow = `| ${headerLabels.join(' | ')} |`;
    const separatorRow = `| ${headerLabels.map(() => ':---').join(' | ')} |`;
    const dataRows = history.map(row => 
        `| ${row.delta_swastika.toFixed(4)} | ${row.latency.toFixed(2)} | ${row.energy.toFixed(4)} | ${row.thermalLoad.toFixed(4)} |`
    ).join('\n');

    const mdContent = [
        '# Lattice State Metrics History',
        '',
        `**Generated:** ${new Date().toLocaleString()}`,
        '',
        headerRow,
        separatorRow,
        dataRows
    ].join('\n');

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `metrics-history-${new Date().toISOString()}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="component-panel w-full p-3 rounded-lg grid grid-cols-3 gap-x-2 gap-y-4 relative">
        <div className="absolute top-2 right-2 flex gap-2 z-20">
             <Tooltip text={viewMode === 'TIME' ? "Switch to Frequency Domain (FFT)" : "Switch to Time Domain"}>
                <button 
                    onClick={() => setViewMode(m => m === 'TIME' ? 'FREQ' : 'TIME')} 
                    className="text-gray-400 hover:text-white transition-colors p-1.5 bg-slate-800/80 rounded-sm border border-slate-700 hover:border-slate-500"
                >
                    {viewMode === 'TIME' ? <BarChartIcon /> : <WaveIcon />}
                </button>
            </Tooltip>
            <Tooltip text="Export metrics history to CSV">
                <button onClick={handleExport} disabled={history.length === 0} className="text-gray-400 hover:text-white transition-colors p-1.5 bg-slate-800/80 rounded-sm border border-slate-700 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed">
                    <DownloadIcon />
                </button>
            </Tooltip>
            <Tooltip text="Export metrics history to Markdown (.md)">
                <button onClick={handleMarkdownExport} disabled={history.length === 0} className="text-gray-400 hover:text-white transition-colors p-1.5 bg-slate-800/80 rounded-sm border border-slate-700 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed">
                    <MarkdownIcon />
                </button>
            </Tooltip>
        </div>
        
      <MetricItem 
        title="Protection (Δs)"
        value={metrics.delta_swastika.toFixed(2)}
        history={deltaSwastikaHistory}
        color="#ff5500"
        mode={viewMode}
      />
      <MetricItem
        title="Latency (ms)"
        value={Math.round(metrics.latency).toString()}
        history={latencyHistory}
        color="#00ffcc"
        mode={viewMode}
      />
      <MetricItem
        title="Thermal Load"
        value={`${(metrics.thermalLoad * 100).toFixed(1)}%`}
        history={thermalLoadHistory}
        color="#f97316"
        mode={viewMode}
      />
    </div>
  );
};
