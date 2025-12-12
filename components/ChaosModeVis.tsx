
import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

interface ChaosModeVisProps {
  metricsHistory: MetricsData[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  baseRadius: number;
  color: string;
}

const PARTICLE_COUNT = 200;
const MAX_DELTA_NORMALIZED = 50; // A baseline to normalize the chaos value

export const ChaosModeVis: React.FC<ChaosModeVisProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: Math.random() * 100,
          baseRadius: 1 + Math.random() * 1.5,
          color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`,
        });
      }
    }

    let animationFrameId: number;
    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'; // Fading effect
      ctx.fillRect(0, 0, W, H);

      const lastMetric = metricsHistory[metricsHistory.length - 1] || { delta_swastika: 0 };
      const chaos = Math.min(1.0, lastMetric.delta_swastika / MAX_DELTA_NORMALIZED);

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.5;

        p.vx += (Math.random() - 0.5) * (0.1 + chaos * 0.5);
        p.vy += (Math.random() - 0.5) * (0.1 + chaos * 0.5);
        // Clamp velocity
        p.vx = Math.max(-3, Math.min(3, p.vx));
        p.vy = Math.max(-3, Math.min(3, p.vy));

        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || p.life <= 0) {
          p.x = W / 2;
          p.y = H / 2;
          p.vx = (Math.random() - 0.5) * 2 * (1 + chaos);
          p.vy = (Math.random() - 0.5) * 2 * (1 + chaos);
          p.life = 100 + Math.random() * 50;
        }
        
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 100 * (0.5 + chaos * 0.5);
        ctx.arc(p.x, p.y, p.baseRadius * (1 + chaos), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [metricsHistory]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full max-h-full"
        aria-label="Chaos Mode: An abstract visualization of system entropy."
      />
    </div>
  );
};
