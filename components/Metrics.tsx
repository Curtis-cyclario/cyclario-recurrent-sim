
import React from 'react';
import type { MetricsData } from '../types';
import { FrequencyDomainScope } from './FrequencyDomainScope';
import { Tooltip } from './Tooltip';

interface MetricsProps {
  metrics: MetricsData;
  history: MetricsData[];
}

const HISTORY_LENGTH = 128; // FFT works best with powers of 2

const MetricItem: React.FC<{title: string; value: string; history: number[]; color: string}> = ({ title, value, history, color }) => (
    <div className="flex flex-col items-center justify-start text-center h-full">
      <div>
        <p className="text-xs text-cyan-400/70 tracking-widest uppercase">{title}</p>
        <p className="font-orbitron text-2xl lg:text-3xl text-cyan-300 tracking-wider my-1" style={{textShadow: `0 0 5px ${color}`}}>
          {value}
        </p>
      </div>
      <div className="mt-auto w-full">
        <FrequencyDomainScope data={history} color={color} width={120} height={40} />
      </div>
    </div>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export const Metrics: React.FC<MetricsProps> = ({ metrics, history }) => {
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

  return (
    <div className="component-panel w-full p-3 rounded-lg grid grid-cols-3 gap-x-2 gap-y-4 relative">
        <Tooltip text="Export metrics history to CSV">
            <button onClick={handleExport} disabled={history.length === 0} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-10">
                <DownloadIcon />
            </button>
        </Tooltip>
      <MetricItem 
        title="Protection (Δs)"
        value={metrics.delta_swastika.toFixed(2)}
        history={deltaSwastikaHistory}
        color="#ff5500"
      />
      <MetricItem
        title="Latency (ms)"
        value={Math.round(metrics.latency).toString()}
        history={latencyHistory}
        color="#00ffcc"
      />
      <MetricItem
        title="Thermal Load"
        value={`${(metrics.thermalLoad * 100).toFixed(1)}%`}
        history={thermalLoadHistory}
        color="#f97316"
      />
    </div>
  );
};
