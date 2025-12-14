
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

    // 1. Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Identify Active Nodes in Current Frame
    const currentActiveCells: {i: number, j: number}[] = [];
    for(let i=0; i<SIZE; i++) {
        for(let j=0; j<SIZE; j++) {
            if(lattice[i][j].some(val => val === 1)) {
                currentActiveCells.push({i, j});
            }
        }
    }

    // 3. Draw Causal Links (Propagation)
    // We check if an active cell in Current Frame had an active neighbor in Previous Frame
    // If so, we draw a line to represent the signal traveling.
    
    ctx.lineWidth = 1.5;
    
    currentActiveCells.forEach(({i, j}) => {
        const cx = (j + 0.5) * CELL_SIZE;
        const cy = (i + 0.5) * CELL_SIZE;
        
        // Check 8 neighbors in PREVIOUS lattice
        for(let di=-1; di<=1; di++){
            for(let dj=-1; dj<=1; dj++){
                if(di===0 && dj===0) continue;
                
                const prevI = (i - di + SIZE) % SIZE; // Reverse direction to find source
                const prevJ = (j - dj + SIZE) % SIZE;
                
                // Was the neighbor active in the previous tick?
                const neighborActive = prevLattice[prevI][prevJ].some(val => val === 1);
                
                if(neighborActive) {
                    const nx = (prevJ + 0.5) * CELL_SIZE;
                    const ny = (prevI + 0.5) * CELL_SIZE;

                    // Create gradient for directionality (Source -> Dest)
                    const grad = ctx.createLinearGradient(nx, ny, cx, cy);
                    grad.addColorStop(0, 'rgba(6, 182, 212, 0.1)'); // Faint at source
                    grad.addColorStop(1, 'rgba(6, 182, 212, 1.0)'); // Bright at dest

                    ctx.strokeStyle = grad;
                    ctx.beginPath();
                    ctx.moveTo(nx, ny);
                    ctx.lineTo(cx, cy);
                    ctx.stroke();
                }
            }
        }
    });

    // 4. Draw Interconnects (Long Range)
    // Visualize active interconnects as distinct "Highways"
    const drawInterconnectLine = (x1: number, y1: number, x2: number, y2: number, color: string) => {
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.shadowBlur = 0;
    }

    interconnects.rows.forEach((isOn, idx) => {
        if(isOn) {
            const r = INTERCONNECT_CHANNELS[idx];
            const y = (r+0.5)*CELL_SIZE;
            drawInterconnectLine(0, y, CANVAS_SIZE, y, '#d946ef'); // Fuchsia
        }
    });
    interconnects.cols.forEach((isOn, idx) => {
        if(isOn) {
            const c = INTERCONNECT_CHANNELS[idx];
            const x = (c+0.5)*CELL_SIZE;
            drawInterconnectLine(x, 0, x, CANVAS_SIZE, '#eab308'); // Yellow/Gold
        }
    });

    // 5. Draw Active Nodes (Sinks)
    currentActiveCells.forEach(({i, j}) => {
        const x = j * CELL_SIZE;
        const y = i * CELL_SIZE;
        
        // Check if it was also active previously (Persistence)
        const persisted = prevLattice[i][j].some(val => val === 1);
        
        ctx.fillStyle = persisted ? '#0ea5e9' : '#ffffff'; // White for new activations (Hot), Blue for persistent
        
        const size = persisted ? 6 : 10;
        const offset = (CELL_SIZE - size) / 2;
        
        if (!persisted) {
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
        }
        
        ctx.fillRect(x + offset, y + offset, size, size);
        ctx.shadowBlur = 0;
    });

    // Overlay Grid for context
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for(let i=0; i<=SIZE; i++) {
        const p = i * CELL_SIZE;
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(CANVAS_SIZE, p); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, CANVAS_SIZE); ctx.stroke();
    }

  }, [lattice, prevLattice, interconnects]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <canvas 
            ref={canvasRef} 
            width={CANVAS_SIZE} 
            height={CANVAS_SIZE} 
            className="max-w-full max-h-full border border-slate-700 bg-slate-900 rounded-sm" 
            aria-label="Signal Pathways: Visualizing causal links between time steps." 
        />
    </div>
  );
};
