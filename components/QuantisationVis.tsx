import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

interface QuantisationVisProps {
  metricsHistory: MetricsData[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

const PARTICLE_COUNT = 250;
const MAX_DELTA_FOR_VIS = 40; // Normalize delta for visual effect
const GRID_SIZE = 5; // Create a 5x5 grid of attractors

export const QuantisationVis: React.FC<QuantisationVisProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();
  const attractorsRef = useRef<{ x: number, y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Initialize attractors
    if (attractorsRef.current.length === 0) {
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          attractorsRef.current.push({
            x: (W / (GRID_SIZE + 1)) * (j + 1),
            y: (H / (GRID_SIZE + 1)) * (i + 1),
          });
        }
      }
    }

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: 0,
          vy: 0,
          color: `hsl(${200 + Math.random() * 60}, 100%, 70%)`,
        });
      }
    }

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; // Fading effect
      ctx.fillRect(0, 0, W, H);

      const lastMetric = metricsHistory[metricsHistory.length - 1] || { delta_swastika: 0, energy: 0 };
      const chaos = Math.min(1, lastMetric.delta_swastika / MAX_DELTA_FOR_VIS);
      
      // Quantization Factor: Strong when chaos is low, weak when high.
      const quantizationFactor = Math.pow(1 - chaos, 4);

      particlesRef.current.forEach(p => {
        // Find nearest attractor
        let nearestDist = Infinity;
        let nearestAttractor = attractorsRef.current[0];
        for (const attractor of attractorsRef.current) {
          const dist = Math.hypot(p.x - attractor.x, p.y - attractor.y);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestAttractor = attractor;
          }
        }

        // Apply forces: pull towards attractor, and a random walk
        const ax = (nearestAttractor.x - p.x) * 0.005 * quantizationFactor;
        const ay = (nearestAttractor.y - p.y) * 0.005 * quantizationFactor;

        p.vx += ax + (Math.random() - 0.5) * 0.2 * (1 - quantizationFactor);
        p.vy += ay + (Math.random() - 0.5) * 0.2 * (1 - quantizationFactor);
        
        // Apply friction
        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around edges
        if(p.x < 0) p.x = W;
        if(p.x > W) p.x = 0;
        if(p.y < 0) p.y = H;
        if(p.y > H) p.y = 0;

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.5 + lastMetric.energy * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + (1 - quantizationFactor) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [metricsHistory]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full max-h-full"
        aria-label="Quadratic Quantisation: An abstract visualization of the automaton's macro-dynamics."
      />
    </div>
  );
};
