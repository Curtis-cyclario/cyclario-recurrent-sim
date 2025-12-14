
import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

interface EntropyVisProps {
  metricsHistory: MetricsData[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  baseRadius: number;
  colorHue: number;
}

const PARTICLE_COUNT = 200;
const MAX_DELTA_NORMALIZED = 50; // A baseline to normalize the chaos value (delta_swastika)

export const EntropyVis: React.FC<EntropyVisProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Initialize particles if empty
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: Math.random() * 100,
          baseRadius: 1 + Math.random() * 2,
          colorHue: 180 + Math.random() * 60, // Blue-Cyan range initially
        });
      }
    }

    let animationFrameId: number;

    const render = () => {
      // Fade trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, W, H);

      // Get latest metrics
      const lastMetric = metricsHistory[metricsHistory.length - 1] || { delta_swastika: 0 };
      
      // Calculate Chaos Factor (0.0 to 1.0+)
      const chaos = Math.min(1.5, lastMetric.delta_swastika / MAX_DELTA_NORMALIZED);
      
      // Target Color Hue based on Chaos: Blue (200) -> Red (0)
      const targetHue = 200 - (chaos * 200); 

      particlesRef.current.forEach(p => {
        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.5;

        // Apply Chaos to Velocity (Brownian agitation)
        const agitation = 0.2 + chaos * 2.0;
        p.vx += (Math.random() - 0.5) * agitation;
        p.vy += (Math.random() - 0.5) * agitation;

        // Apply Friction (dampening) to prevent explosion
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Shift color towards target hue
        p.colorHue = p.colorHue * 0.95 + targetHue * 0.05;

        // Boundary Wrap & Reset
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || p.life <= 0) {
          p.x = W / 2 + (Math.random() - 0.5) * 50; // Spawn near center
          p.y = H / 2 + (Math.random() - 0.5) * 50;
          
          // Explosive spawn if high chaos
          const spawnSpeed = 2 * (1 + chaos * 3);
          const angle = Math.random() * Math.PI * 2;
          p.vx = Math.cos(angle) * spawnSpeed;
          p.vy = Math.sin(angle) * spawnSpeed;
          
          p.life = 100 + Math.random() * 50;
          p.colorHue = targetHue + (Math.random() - 0.5) * 40;
        }
        
        // Draw
        ctx.beginPath();
        const saturation = 70 + chaos * 30; // More saturated when chaotic
        const lightness = 60 + chaos * 20; // Brighter when chaotic
        ctx.fillStyle = `hsla(${p.colorHue}, ${saturation}%, ${lightness}%, ${p.life / 100})`;
        
        // Size pulses with chaos
        const size = p.baseRadius * (1 + chaos);
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Overlay Metric Text
      ctx.fillStyle = `hsla(${targetHue}, 80%, 70%, 0.8)`;
      ctx.font = '12px "Orbitron"';
      ctx.textAlign = 'left';
      ctx.fillText(`ENTROPY FLUX: ${chaos.toFixed(3)}`, 10, H - 10);

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
        className="max-w-full max-h-full border border-slate-800 bg-slate-950 rounded-sm"
        aria-label="Entropy Mode: Visualizing system disorder via particle agitation."
      />
    </div>
  );
};
