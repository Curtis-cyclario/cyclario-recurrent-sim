
import React, { useRef, useEffect, useMemo } from 'react';
import type { MetricsData } from '../types';

interface QuantizationFieldProps {
  metricsHistory: MetricsData[];
}

const LAYER_COUNT = 6; // Z-depth of our lattice
const RING_SPACING = 35;
const BASE_RADIUS = 60;

export const QuantizationField: React.FC<QuantizationFieldProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Initializing with undefined to satisfy strict "useRef" argument requirements
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
      // 1. Telemetry Extraction
      const last = metricsHistory[metricsHistory.length - 1] || { energy: 0, delta_swastika: 0, thermalLoad: 0 };
      const energy = last.energy;
      const entropy = Math.min(1.5, last.delta_swastika / 35);
      const thermal = last.thermalLoad;

      time += 0.01 + energy * 0.02;

      // 2. Clear & Base Styling
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      // Additive glow pass
      ctx.globalCompositeOperation = 'screen';

      // 3. The Heliostat (Central Core)
      // Pulses with global energy
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

      // Solar Flux Rays (Entropy based)
      if (entropy > 0.1) {
        ctx.strokeStyle = `rgba(129, 140, 248, ${entropy * 0.3})`;
        ctx.lineWidth = 1;
        const rayCount = 12;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + time;
          const length = 100 + entropy * 100 + Math.sin(time * 10 + i) * 20;
          ctx.beginPath();
          ctx.moveTo(CX + Math.cos(angle) * coreSize, CY + Math.sin(angle) * coreSize);
          ctx.lineTo(CX + Math.cos(angle) * length, CY + Math.sin(angle) * length);
          ctx.stroke();
        }
      }

      // 4. Quantized Orbital Shells (Z-Layers)
      for (let z = 0; z < LAYER_COUNT; z++) {
        const radius = BASE_RADIUS + z * RING_SPACING;
        const orbitSpeed = (0.5 + (z * 0.1)) * (1 + energy);
        
        // Ring Distortion (higher entropy = more wobbly orbits)
        ctx.beginPath();
        const segments = 64;
        for (let s = 0; s <= segments; s++) {
          const angle = (s / segments) * Math.PI * 2;
          const wobble = Math.sin(angle * (3 + z) + time * 2) * entropy * 15;
          const r = radius + wobble;
          const x = CX + Math.cos(angle) * r;
          const y = CY + Math.sin(angle) * r;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.15 - (z * 0.02)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Resonance Nodes (Quantization markers)
        // These snap to fixed angular intervals to visualize "Quantization"
        const nodeCount = 8;
        for (let n = 0; n < nodeCount; n++) {
          const baseAngle = (n / nodeCount) * Math.PI * 2 + (time * orbitSpeed);
          
          // Apply "Quantization Snap" - nodes resist smooth motion when energy is efficient
          const snapFactor = 1 - entropy; 
          const quantizedAngle = snapFactor > 0.5 
            ? Math.round(baseAngle / (Math.PI / 4)) * (Math.PI / 4) 
            : baseAngle;
          
          // Dynamic interpolation between smooth and snapped
          const finalAngle = baseAngle * entropy + quantizedAngle * (1 - entropy);

          const nx = CX + Math.cos(finalAngle) * radius;
          const ny = CY + Math.sin(finalAngle) * radius;

          // Node intensity tied to thermal load
          const nodePulse = Math.abs(Math.sin(time * 3 + n));
          const nodeSize = 3 + (energy * 4) + (nodePulse * 2);
          
          ctx.fillStyle = n % 2 === 0 ? '#22d3ee' : '#818cf8';
          if (thermal > 0.6) ctx.fillStyle = '#f43f5e'; // Heat warning

          ctx.beginPath();
          ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Connect nodes to core with "Tethers"
          ctx.globalAlpha = 0.1 * (1 - entropy);
          ctx.beginPath();
          ctx.moveTo(CX, CY);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      ctx.globalCompositeOperation = 'source-over';

      // 5. HUD Readouts
      ctx.fillStyle = '#94a3b8';
      ctx.font = '900 10px "Orbitron"';
      ctx.textAlign = 'right';
      ctx.fillText(`HELIOS_FLUX: ${(energy * 100).toFixed(1)}%`, W - 30, 40);
      ctx.fillText(`QUANT_LEVEL: ${LAYER_COUNT} STACK`, W - 30, 55);
      
      const drift = (entropy * 10).toFixed(2);
      ctx.fillStyle = entropy > 0.5 ? '#f43f5e' : '#22d3ee';
      ctx.fillText(`ORBITAL_DRIFT: ${drift} mrad`, W - 30, 70);

      // Corner Crosshair
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CX - 10, CY); ctx.lineTo(CX + 10, CY);
      ctx.moveTo(CX, CY - 10); ctx.lineTo(CX, CY + 10);
      ctx.stroke();

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [metricsHistory]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950 rounded-sm overflow-hidden border border-slate-800 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] relative group">
      {/* Decorative Overlays */}
      <div className="absolute top-4 left-6 hud-label text-[7px] opacity-20 group-hover:opacity-100 transition-opacity">
        ANGULAR_SNAP: ACTIVE
      </div>
      <div className="absolute bottom-4 left-6 hud-label text-[7px] opacity-20 group-hover:opacity-100 transition-opacity">
        Z_PLANE_ISOLATION: 0.992 η
      </div>
      
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full max-h-full"
        aria-label="Heliocentric Quantization Engine"
      />
    </div>
  );
};
