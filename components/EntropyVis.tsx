
import React, { useRef, useEffect, useMemo } from 'react';
import type { MetricsData } from '../types';
import { calculateFFT, padSignal } from '../utils/fft';

interface EntropyVisProps {
  metricsHistory: MetricsData[];
}

interface Point3D { x: number; y: number; z: number; }

const MAX_DELTA_NORMALIZED = 40; 
const TORUS_MAJOR_RADIUS = 140;
const TORUS_MINOR_RADIUS = 50;
const SEGMENTS_U = 24; // Longitude
const SEGMENTS_V = 12; // Latitude

export const EntropyVis: React.FC<EntropyVisProps> = ({ metricsHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine Peak Frequency for visceral pulsing
  const peakFrequencyValue = useMemo(() => {
    const energyHistory = metricsHistory.map(h => h.energy).slice(-64);
    if (energyHistory.length < 16) return 0.1;
    const padded = padSignal(energyHistory);
    const fft = calculateFFT(padded);
    if (!fft || fft.length < 2) return 0.1;

    let maxMag = 0;
    let maxIdx = 1;
    for (let i = 1; i < fft.length; i++) {
        if (fft[i] > maxMag) {
            maxMag = fft[i];
            maxIdx = i;
        }
    }
    return (maxIdx / fft.length);
  }, [metricsHistory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const CX = W / 2;
    const CY = H / 2;

    // Generate Toroidal Lattice Vertices
    const generateTorus = (major: number, minor: number): Point3D[] => {
      const verts: Point3D[] = [];
      for (let i = 0; i < SEGMENTS_U; i++) {
        const u = (i / SEGMENTS_U) * Math.PI * 2;
        for (let j = 0; j < SEGMENTS_V; j++) {
          const v = (j / SEGMENTS_V) * Math.PI * 2;
          verts.push({
            x: (major + minor * Math.cos(v)) * Math.cos(u),
            y: (major + minor * Math.cos(v)) * Math.sin(u),
            z: minor * Math.sin(v)
          });
        }
      }
      return verts;
    };

    const torusVerts = generateTorus(TORUS_MAJOR_RADIUS, TORUS_MINOR_RADIUS);

    let time = 0;
    let animationFrameId: number;

    const project = (p: Point3D, rotX: number, rotY: number, rotZ: number): Point3D => {
        let { x, y, z } = p;
        // Y-axis rotation
        let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
        let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
        x = x1; z = z1;
        // X-axis rotation
        let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
        let z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
        y = y1; z = z2;
        // Z-axis rotation
        let x2 = x * Math.cos(rotZ) - y * Math.sin(rotZ);
        let y2 = x * Math.sin(rotZ) + y * Math.cos(rotZ);
        return { x: x2, y: y2, z: z2 };
    };

    const render = () => {
        const lastMetric = metricsHistory[metricsHistory.length - 1] || { delta_swastika: 0, energy: 0 };
        const rawEntropy = lastMetric.delta_swastika / MAX_DELTA_NORMALIZED;
        const entropy = Math.min(2.0, Math.max(0, rawEntropy));
        const energyFactor = lastMetric.energy || 0.1;

        time += 0.01 + entropy * 0.03;
        const pulse = Math.abs(Math.sin(time * 12 * (0.5 + peakFrequencyValue)));
        
        // Darkened background for glow persistence
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, W, H);

        // Additive blending for "light" effect
        ctx.globalCompositeOperation = 'screen';

        const drawPass = (color: string, offset: number, scaleMod: number) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = (0.5 + entropy) * (1 + pulse * 0.5);
            ctx.beginPath();

            const rotX = time * 0.3 + offset;
            const rotY = time * 0.5 + offset;
            const rotZ = time * 0.2;

            for (let i = 0; i < SEGMENTS_U; i++) {
                for (let j = 0; j < SEGMENTS_V; j++) {
                    const idx = i * SEGMENTS_V + j;
                    const p = torusVerts[idx];
                    
                    // Apply dynamic entropy distortion to vertices
                    const noise = (Math.random() - 0.5) * entropy * 30;
                    const pDistorted = { 
                        x: p.x * scaleMod + noise, 
                        y: p.y * scaleMod + noise, 
                        z: p.z * scaleMod + noise 
                    };

                    const proj = project(pDistorted, rotX, rotY, rotZ);
                    const scale = 300 / (400 + proj.z);
                    const screenX = CX + proj.x * scale;
                    const screenY = CY + proj.y * scale;

                    if (j === 0) ctx.moveTo(screenX, screenY);
                    else ctx.lineTo(screenX, screenY);

                    // Cross-segment lines (longitudinal)
                    const nextUIdx = ((i + 1) % SEGMENTS_U) * SEGMENTS_V + j;
                    const pNext = torusVerts[nextUIdx];
                    const projNext = project(pNext, rotX, rotY, rotZ);
                    const scaleNext = 300 / (400 + projNext.z);
                    ctx.moveTo(screenX, screenY);
                    ctx.lineTo(CX + projNext.x * scaleNext, CY + projNext.y * scaleNext);
                }
            }
            ctx.stroke();
        };

        // Draw RGB Refraction Passes
        const aberration = entropy * 20;
        drawPass(`rgba(255, 50, 100, ${0.3 + energyFactor * 0.4})`, -aberration * 0.01, 1.0);
        drawPass(`rgba(34, 211, 238, ${0.4 + energyFactor * 0.5})`, 0, 1.0);
        drawPass(`rgba(129, 140, 248, ${0.3 + energyFactor * 0.4})`, aberration * 0.01, 1.0);

        // Core "Unversed Star" visualization (Stable Center)
        ctx.globalCompositeOperation = 'lighter';
        const starSize = 20 * (1 - entropy * 0.5) + pulse * 10;
        const grad = ctx.createRadialGradient(CX, CY, 0, CX, CY, starSize * 4);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, 'rgba(34, 211, 238, 0.6)');
        grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(CX, CY, starSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Refractive Distortion Lines (Simulating lens stress)
        if (entropy > 0.1) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${entropy * 0.2})`;
            ctx.lineWidth = 1;
            for(let k = 0; k < 5; k++) {
                const yPos = (Math.sin(time + k) * 0.5 + 0.5) * H;
                ctx.beginPath();
                ctx.moveTo(0, yPos);
                ctx.lineTo(W, yPos);
                ctx.stroke();
            }
        }

        ctx.globalCompositeOperation = 'source-over';

        // Integrated HUD Elements
        ctx.textAlign = 'left';
        ctx.font = '900 12px "Orbitron"';
        const statusColor = entropy > 0.6 ? '#f43f5e' : entropy > 0.2 ? '#fbbf24' : '#22d3ee';
        ctx.fillStyle = statusColor;
        ctx.fillText(`FLUX_CAPACITY: ${(energyFactor * 100).toFixed(1)}%`, 30, 45);
        ctx.fillText(`COHERENCE_STATE: ${entropy < 0.15 ? 'NOMINAL' : entropy < 0.5 ? 'DEVIATING' : 'CRITICAL'}`, 30, 62);
        
        ctx.font = '400 9px "Roboto Mono"';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(`REFRACTIVE_INDEX: ${(1.0 + entropy).toFixed(3)} η`, 30, 80);
        ctx.fillText(`BRANCHALLETIEL_STRESS: ${(entropy * 10).toFixed(2)} dB`, 30, 95);

        // Scanline Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for(let i=0; i<H; i+=4) ctx.fillRect(0, i, W, 1);

        // Technical Framing
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.lineWidth = 1;
        const p = 25;
        ctx.strokeRect(p, p, W - p*2, H - p*2);
        
        // Moving target reticle
        const rx = CX + Math.cos(time * 0.5) * 50;
        const ry = CY + Math.sin(time * 0.5) * 50;
        ctx.beginPath();
        ctx.arc(rx, ry, 5, 0, Math.PI * 2);
        ctx.moveTo(rx - 10, ry); ctx.lineTo(rx + 10, ry);
        ctx.moveTo(rx, ry - 10); ctx.lineTo(rx, ry + 10);
        ctx.stroke();

        animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [metricsHistory, peakFrequencyValue]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950 rounded-sm overflow-hidden border border-slate-800 shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] relative group">
      {/* Corner UI Accents */}
      <div className="absolute top-6 right-8 hud-label text-[8px] opacity-30 group-hover:opacity-100 transition-opacity">
        SENSOR_ID: 0x44-B
      </div>
      <div className="absolute bottom-8 right-8 hud-label text-[8px] opacity-30 group-hover:opacity-100 transition-opacity">
        STABILITY_TRAP: ENGAGED
      </div>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        className="max-w-full max-h-full"
        aria-label="Branchalletiel Refractive Engine"
      />
    </div>
  );
};
