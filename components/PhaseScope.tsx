
import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

interface PhaseScopeProps {
  metricsHistory: MetricsData[];
}

const CANVAS_SIZE = 270;
const HISTORY_LENGTH = 150; // How many points to draw in the trail
const MAX_DELTA = 30; // Estimated max value for delta to normalize plotting
const MAX_ENERGY = 1.0; // Max energy is 1.0

// Helper function to map thermal load (0-1) to a color in a perceptually-friendly gradient.
const getThermalColor = (thermalLoad: number, alpha: number = 1): string => {
    const load = Math.max(0, Math.min(1, thermalLoad));
    let r, g, b;
    if (load < 0.5) { // Cyan -> Yellow
        const t = load * 2;
        r = 0 + (255 - 0) * t; g = 255; b = 204 + (0 - 204) * t;
    } else { // Yellow -> Orange-Red
        const t = (load - 0.5) * 2;
        r = 255; g = 255 + (85 - 255) * t; b = 0;
    }
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

const MetricDisplay: React.FC<{ title: string; value: string; history: number[]; color: string; }> = ({ title, value, history, color }) => {
    const sparklineRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = sparklineRef.current;
        if (!canvas || history.length < 2) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const maxVal = Math.max(...history, 0);
        const minVal = Math.min(...history);
        const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

        const points = history.map((d, i) => ({
            x: (i / (history.length - 1)) * width,
            y: height - ((d - minVal) / range) * (height - 2), // -2 for padding
        }));

        // Gradient fill below line
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `${color}40`); // ~25% opacity
        gradient.addColorStop(1, `${color}00`); // 0% opacity
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Stroke the line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

    }, [history, color]);

    return (
        <div className="bg-slate-900/40 p-2 rounded-md">
            <div className="flex justify-between items-baseline">
                <h4 className="text-xs text-cyan-400/70 tracking-widest uppercase">{title}</h4>
                <span className="font-orbitron text-lg text-glow" style={{color}}>{value}</span>
            </div>
            <canvas ref={sparklineRef} width={100} height={25} className="mt-1 w-full" />
        </div>
    );
};


export const PhaseScope: React.FC<PhaseScopeProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Initializing with undefined to satisfy strict "useRef" argument requirements
  const animationFrameId = useRef<number | undefined>(undefined);

  const latestMetrics = metricsHistory[metricsHistory.length - 1] || { delta_swastika: 0, latency: 0, energy: 0, thermalLoad: 0 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw grid
      ctx.strokeStyle = "rgba(0, 170, 255, 0.15)";
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 10; i++) {
        const pos = (i / 10) * CANVAS_SIZE;
        ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(CANVAS_SIZE, pos); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, CANVAS_SIZE); ctx.stroke();
      }

      // Draw Axis Labels
      ctx.fillStyle = "rgba(0, 170, 255, 0.4)";
      ctx.font = '10px "Roboto Mono"';
      ctx.textAlign = 'center';
      ctx.fillText("Protection (Δs)", CANVAS_SIZE / 2, CANVAS_SIZE - 5);
      ctx.save();
      ctx.translate(10, CANVAS_SIZE / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Energy", 0, 0);
      ctx.restore();

      const pointsData = metricsHistory.slice(-HISTORY_LENGTH);
      if (pointsData.length < 2) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }
      
      // Draw trail
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 1; i < pointsData.length; i++) {
          const prevPoint = pointsData[i-1];
          const currentPoint = pointsData[i];
          const x1 = (prevPoint.delta_swastika / MAX_DELTA) * CANVAS_SIZE;
          const y1 = CANVAS_SIZE - (prevPoint.energy / MAX_ENERGY) * CANVAS_SIZE;
          const x2 = (currentPoint.delta_swastika / MAX_DELTA) * CANVAS_SIZE;
          const y2 = CANVAS_SIZE - (currentPoint.energy / MAX_ENERGY) * CANVAS_SIZE;
          const alpha = i / pointsData.length; 
          
          const segmentGradient = ctx.createLinearGradient(x1, y1, x2, y2);
          segmentGradient.addColorStop(0, getThermalColor(prevPoint.thermalLoad, alpha * 0.9));
          segmentGradient.addColorStop(1, getThermalColor(currentPoint.thermalLoad, alpha * 0.9));
          ctx.strokeStyle = segmentGradient;
          
          const thermalGlow = currentPoint.thermalLoad * 8;
          ctx.shadowBlur = thermalGlow;
          ctx.shadowColor = getThermalColor(currentPoint.thermalLoad, 1);

          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      
      // Draw current position head
      const lastPoint = pointsData[pointsData.length - 1];
      const headX = (lastPoint.delta_swastika / MAX_DELTA) * CANVAS_SIZE;
      const headY = CANVAS_SIZE - (lastPoint.energy / MAX_ENERGY) * CANVAS_SIZE;

      ctx.beginPath(); ctx.arc(headX, headY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = getThermalColor(lastPoint.thermalLoad, 1);
      ctx.shadowColor = getThermalColor(lastPoint.thermalLoad, 1);
      ctx.shadowBlur = 12; ctx.fill();
      
      ctx.beginPath(); ctx.arc(headX, headY, 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 0; ctx.fill();

      ctx.shadowBlur = 0;
      animationFrameId.current = requestAnimationFrame(render);
    };
    animationFrameId.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [metricsHistory]);

  const SPARKLINE_HISTORY = 50;

  return (
    <div className="component-panel p-4 rounded-lg w-full">
        <h3 className="text-lg font-orbitron font-bold text-cyan-300 mb-1 text-center tracking-wider">
            SYSTEM TELEMETRY
        </h3>
        <p className="text-center text-xs text-cyan-500/80 mb-3 -mt-1">Energy vs. Protection (Δs)</p>
        <div className="relative scanlines rounded-md overflow-hidden">
            <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="bg-slate-950 mx-auto block"
                aria-label="Phase scope visualization plotting system energy vs delta"
            />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
            <MetricDisplay 
                title="Protection (Δs)"
                value={latestMetrics.delta_swastika.toFixed(2)}
                history={metricsHistory.slice(-SPARKLINE_HISTORY).map(h => h.delta_swastika)}
                color="#ff5500"
            />
            <MetricDisplay 
                title="Latency (ms)"
                value={Math.round(latestMetrics.latency).toString()}
                history={metricsHistory.slice(-SPARKLINE_HISTORY).map(h => h.latency)}
                color="#00ffcc"
            />
             <MetricDisplay 
                title="Energy"
                value={`${(latestMetrics.energy * 100).toFixed(1)}%`}
                history={metricsHistory.slice(-SPARKLINE_HISTORY).map(h => h.energy)}
                color="#38bdf8"
            />
             <MetricDisplay 
                title="Thermal Load"
                value={`${(latestMetrics.thermalLoad * 100).toFixed(1)}%`}
                history={metricsHistory.slice(-SPARKLINE_HISTORY).map(h => h.thermalLoad)}
                color="#f97316"
            />
        </div>
        <div className="w-full px-2 mt-4">
            <div className="w-full h-2 rounded-full" style={{ background: 'linear-gradient(to right, #00ffcc, #ffff00, #ff5500)' }} />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Low</span>
                <span className="font-bold">Thermal Load</span>
                <span>High</span>
            </div>
        </div>
    </div>
  );
};
