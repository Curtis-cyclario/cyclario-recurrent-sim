
import React, { useRef, useEffect } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, DEPTH, INTERCONNECT_CHANNELS } from '../constants';

interface PathwaysMonitorProps {
  lattice: Lattice3D;
  prevLattice: Lattice3D;
  interconnects: { rows: boolean[]; cols: boolean[]; };
}

const CANVAS_SIZE = 540;
const CELL_SIZE = CANVAS_SIZE / SIZE;

export const PathwaysMonitor: React.FC<PathwaysMonitorProps> = ({ lattice, prevLattice, interconnects }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            let active = false;
            for (let k = 0; k < DEPTH; k++) if (lattice[(i * SIZE * DEPTH) + (j * DEPTH) + k] === 1) { active = true; break; }
            
            if (active) {
                const cx = (j + 0.5) * CELL_SIZE;
                const cy = (i + 0.5) * CELL_SIZE;
                for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    const pi = (i - di + SIZE) % SIZE;
                    const pj = (j - dj + SIZE) % SIZE;
                    let pActive = false;
                    for (let k = 0; k < DEPTH; k++) if (prevLattice[(pi * SIZE * DEPTH) + (pj * DEPTH) + k] === 1) { pActive = true; break; }
                    
                    if (pActive) {
                        ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
                        ctx.beginPath(); ctx.moveTo((pj + 0.5) * CELL_SIZE, (pi + 0.5) * CELL_SIZE); ctx.lineTo(cx, cy); ctx.stroke();
                    }
                }
            }
        }
    }
  }, [lattice, prevLattice]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="hud-label mb-4 opacity-50">CAUSAL_SIGNAL_MONITOR</div>
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="max-w-full block rounded-sm border border-slate-800" />
    </div>
  );
};
