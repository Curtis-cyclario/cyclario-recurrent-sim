
import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

export const EntropyVis: React.FC<{ metricsHistory: MetricsData[] }> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    let frameId: number;
    let offset = 0;

    const render = () => {
        offset += 0.5;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.1)';
        ctx.fillRect(0, 0, W, H);

        const last = metricsHistory[metricsHistory.length - 1];
        const intensity = last ? last.delta_swastika : 0;
        
        const count = 50;
        const cy = H/2;
        
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for(let i=0; i<W; i+=5) {
            const noise = (Math.sin((i + offset) * 0.05) + Math.cos((i - offset) * 0.03)) * intensity * 2;
            const y = cy + noise;
            if(i===0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
        }
        
        ctx.strokeStyle = `hsl(${offset % 360}, 70%, 60%)`;
        ctx.stroke();

        frameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, [metricsHistory]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <canvas ref={canvasRef} width={500} height={500} className="max-w-full max-h-full" aria-label="Entropy Visualization" />
    </div>
  );
};
