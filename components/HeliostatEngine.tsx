
import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

interface HeliostatEngineProps {
  metricsHistory: MetricsData[];
}

const LAYER_COUNT = 6;
const RING_SPACING = 35;
const BASE_RADIUS = 60;

export const HeliostatEngine: React.FC<HeliostatEngineProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const CX = W / 2;
    const CY = H / 2;
    let time = 0;

    const render = () => {
      const last = metricsHistory[metricsHistory.length - 1] || { energy: 0, delta_swastika: 0, thermalLoad: 0 };
      const energy = last.energy;
      const entropy = Math.min(1.5, last.delta_swastika / 35);
      const thermal = last.thermalLoad;

      time += 0.01 + energy * 0.02;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';

      const corePulse = 1 + Math.sin(time * 5) * 0.1 * energy;
      const coreSize = 30 * corePulse + (energy * 20);
      const coreGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreSize * 2);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.2, `rgba(34, 211, 238, ${0.8 + energy * 0.2})`);
      coreGrad.addColorStop(1, 'rgba(34, 211, 238, 0)');
      
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(CX, CY, coreSize * 2, 0, Math.PI * 2);
      ctx.fill();

      for (let z = 0; z < LAYER_COUNT; z++) {
        const radius = BASE_RADIUS + z * RING_SPACING;
        const orbitSpeed = (0.5 + (z * 0.1)) * (1 + energy);
        
        ctx.beginPath();
        const segments = 64;
        for (let s = 0; s <= segments; s++) {
          const angle = (s / segments) * Math.PI * 2;
          const wobble = Math.sin(angle * (3 + z) + time * 2) * entropy * 15;
          const r = radius + wobble;
          const x = CX + Math.cos(angle) * r;
          const y = CY + Math.sin(angle) * r;
          if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.15 - (z * 0.02)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const nodeCount = 8;
        for (let n = 0; n < nodeCount; n++) {
          const baseAngle = (n / nodeCount) * Math.PI * 2 + (time * orbitSpeed);
          const snapFactor = 1 - entropy; 
          const quantizedAngle = snapFactor > 0.5 ? Math.round(baseAngle / (Math.PI / 4)) * (Math.PI / 4) : baseAngle;
          const finalAngle = baseAngle * entropy + quantizedAngle * (1 - entropy);
          const nx = CX + Math.cos(finalAngle) * radius;
          const ny = CY + Math.sin(finalAngle) * radius;
          const nodePulse = Math.abs(Math.sin(time * 3 + n));
          const nodeSize = 3 + (energy * 4) + (nodePulse * 2);
          
          ctx.fillStyle = thermal > 0.6 ? '#f43f5e' : (n % 2 === 0 ? '#22d3ee' : '#818cf8');
          ctx.beginPath();
          ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [metricsHistory]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950 rounded-sm overflow-hidden border border-slate-800 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] relative group">
      <canvas ref={canvasRef} width={500} height={500} className="max-w-full max-h-full" />
    </div>
  );
};
