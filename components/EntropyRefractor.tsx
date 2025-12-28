
import React, { useRef, useEffect } from 'react';
import type { MetricsData } from '../types';

interface EntropyRefractorProps {
  metricsHistory: MetricsData[];
}

interface Point3D { x: number; y: number; z: number; }

const MAX_DELTA_NORMALIZED = 40; 
const TORUS_MAJOR_RADIUS = 140;
const TORUS_MINOR_RADIUS = 50;
const SEGMENTS_U = 24;
const SEGMENTS_V = 12;

export const EntropyRefractor: React.FC<EntropyRefractorProps> = ({ metricsHistory }) => {
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

    const torusVerts: Point3D[] = [];
    for (let i = 0; i < SEGMENTS_U; i++) {
      const u = (i / SEGMENTS_U) * Math.PI * 2;
      for (let j = 0; j < SEGMENTS_V; j++) {
        const v = (j / SEGMENTS_V) * Math.PI * 2;
        torusVerts.push({
          x: (TORUS_MAJOR_RADIUS + TORUS_MINOR_RADIUS * Math.cos(v)) * Math.cos(u),
          y: (TORUS_MAJOR_RADIUS + TORUS_MINOR_RADIUS * Math.cos(v)) * Math.sin(u),
          z: TORUS_MINOR_RADIUS * Math.sin(v)
        });
      }
    }

    let time = 0;
    const project = (p: Point3D, rotX: number, rotY: number, rotZ: number): Point3D => {
        let { x, y, z } = p;
        let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
        let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
        x = x1; z = z1;
        let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
        let z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
        y = y1; z = z2;
        let x2 = x * Math.cos(rotZ) - y * Math.sin(rotZ);
        let y2 = x * Math.sin(rotZ) + y * Math.cos(rotZ);
        return { x: x2, y: y2, z: z2 };
    };

    const render = () => {
        const last = metricsHistory[metricsHistory.length - 1] || { delta_swastika: 0, energy: 0 };
        const entropy = Math.min(2.0, last.delta_swastika / MAX_DELTA_NORMALIZED);
        const energyFactor = last.energy || 0.1;
        time += 0.01 + entropy * 0.03;
        const pulse = Math.abs(Math.sin(time * 6));

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'screen';

        const drawPass = (color: string, offset: number) => {
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
                    const noise = (Math.random() - 0.5) * entropy * 20;
                    const pDistorted = { x: p.x + noise, y: p.y + noise, z: p.z + noise };
                    const proj = project(pDistorted, rotX, rotY, rotZ);
                    const scale = 300 / (400 + proj.z);
                    const screenX = CX + proj.x * scale;
                    const screenY = CY + proj.y * scale;
                    if (j === 0) ctx.moveTo(screenX, screenY); else ctx.lineTo(screenX, screenY);
                    
                    const nextUIdx = ((i + 1) % SEGMENTS_U) * SEGMENTS_V + j;
                    const projNext = project(torusVerts[nextUIdx], rotX, rotY, rotZ);
                    const scaleNext = 300 / (400 + projNext.z);
                    ctx.moveTo(screenX, screenY);
                    ctx.lineTo(CX + projNext.x * scaleNext, CY + projNext.y * scaleNext);
                }
            }
            ctx.stroke();
        };

        const aberration = entropy * 15;
        drawPass(`rgba(255, 50, 100, ${0.3 + energyFactor * 0.4})`, -aberration * 0.01);
        drawPass(`rgba(34, 211, 238, ${0.4 + energyFactor * 0.5})`, 0);
        drawPass(`rgba(129, 140, 248, ${0.3 + energyFactor * 0.4})`, aberration * 0.01);

        ctx.globalCompositeOperation = 'source-over';
        animationFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [metricsHistory]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950 rounded-sm overflow-hidden border border-slate-800 relative group">
      <canvas ref={canvasRef} width={600} height={500} className="max-w-full max-h-full" />
    </div>
  );
};
