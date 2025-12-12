
import React, { useRef, useEffect } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, DEPTH, INTERCONNECT_CHANNELS } from '../constants';

interface SignalPathwaysProps {
  lattice: Lattice3D;
  prevLattice: Lattice3D;
  interconnects: { rows: boolean[]; cols: boolean[]; };
}

const CANVAS_SIZE = 540;
const CELL_SIZE = CANVAS_SIZE / SIZE;

export const SignalPathways: React.FC<SignalPathwaysProps> = ({ lattice, prevLattice, interconnects }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Collect active coordinates
    const active = [];
    for(let i=0; i<SIZE; i++) {
        for(let j=0; j<SIZE; j++) {
            if(lattice[i][j].some(val => val === 1)) active.push({i, j});
        }
    }

    // Draw Pathway Links (Neighbors)
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
    ctx.lineWidth = 1;
    active.forEach(({i, j}) => {
        const cx = (j + 0.5) * CELL_SIZE;
        const cy = (i + 0.5) * CELL_SIZE;
        // Check 8 neighbors for activity
        for(let di=-1; di<=1; di++){
            for(let dj=-1; dj<=1; dj++){
                if(di===0 && dj===0) continue;
                const ni = (i+di+SIZE)%SIZE;
                const nj = (j+dj+SIZE)%SIZE;
                // If neighbor is active
                if(lattice[ni][nj].some(val => val === 1)) {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo((nj+0.5)*CELL_SIZE, (ni+0.5)*CELL_SIZE);
                    ctx.stroke();
                }
            }
        }
    });

    // Draw Interconnects
    ctx.lineWidth = 2;
    interconnects.rows.forEach((isOn, idx) => {
        if(isOn) {
            const r = INTERCONNECT_CHANNELS[idx];
            const y = (r+0.5)*CELL_SIZE;
            ctx.strokeStyle = 'rgba(255, 100, 255, 0.6)';
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_SIZE, y); ctx.stroke();
        }
    });
    interconnects.cols.forEach((isOn, idx) => {
        if(isOn) {
            const c = INTERCONNECT_CHANNELS[idx];
            const x = (c+0.5)*CELL_SIZE;
            ctx.strokeStyle = 'rgba(100, 255, 255, 0.6)';
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_SIZE); ctx.stroke();
        }
    });

    // Draw Nodes
    active.forEach(({i, j}) => {
        const x = j * CELL_SIZE;
        const y = i * CELL_SIZE;
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(x + 10, y + 10, CELL_SIZE - 20, CELL_SIZE - 20);
    });

  }, [lattice, interconnects]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="max-w-full max-h-full" aria-label="Signal Pathways" />
    </div>
  );
};
