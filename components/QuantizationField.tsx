
import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

interface QuantizationFieldProps {
  metricsHistory: MetricsData[];
}

interface Particle {
  x: number; y: number; vx: number; vy: number; color: string;
}

const PARTICLE_COUNT = 150;

export const QuantizationField: React.FC<QuantizationFieldProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    if (particles.current.length === 0) {
        for(let i=0; i<PARTICLE_COUNT; i++) {
            particles.current.push({
                x: Math.random() * W, y: Math.random() * H,
                vx: 0, vy: 0,
                color: `hsl(${180 + Math.random() * 60}, 70%, 60%)`
            });
        }
    }

    let frameId: number;
    const render = () => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
        ctx.fillRect(0, 0, W, H);

        const last = metricsHistory[metricsHistory.length - 1];
        const energy = last ? last.energy : 0;
        const chaos = last ? Math.min(1, last.delta_swastika / 50) : 0;
        
        // Attractor center
        const cx = W / 2;
        const cy = H / 2;

        particles.current.forEach(p => {
            // Physics: orbit with chaotic noise
            const dx = cx - p.x;
            const dy = cy - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Tangential force
            const tx = -dy / (dist + 1);
            const ty = dx / (dist + 1);

            const speed = 0.5 + energy * 2;
            p.vx += (tx * speed * 0.1) + (Math.random()-0.5) * chaos;
            p.vy += (ty * speed * 0.1) + (Math.random()-0.5) * chaos;
            
            // Damping / Pull in
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.x += p.vx;
            p.y += p.vy;

            // Constraints
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5 + energy * 2, 0, Math.PI * 2);
            ctx.fill();
        });
        frameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, [metricsHistory]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <canvas ref={canvasRef} width={500} height={500} className="max-w-full max-h-full" aria-label="Quantization Field" />
    </div>
  );
};
