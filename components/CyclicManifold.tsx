
import React, { useRef, useEffect } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, COLORS, INACTIVE_COLORS, INTERCONNECT_CHANNELS } from '../constants';

interface CyclicManifoldProps {
  lattice: Lattice3D;
  kernelFace: number[][];
  onCellClick: (i: number, j: number, k: number) => void;
  showBorders: boolean;
  interconnects: { rows: boolean[]; cols: boolean[]; };
}

const CANVAS_SIZE = 540;
const CELL_SIZE = CANVAS_SIZE / SIZE;

// Technical colors for CAD view
const WAVEGUIDE_COLOR = '#1e293b'; // Slate 800
const ACTIVE_PULSE_COLOR = '#38bdf8'; // Sky 400
const INTERCONNECT_ACTIVE_COLOR = '#eab308'; // Yellow 500 (Gold)

export const CyclicManifold: React.FC<CyclicManifoldProps> = (props) => {
  const { lattice, kernelFace, onCellClick, showBorders, interconnects } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // 1. Background (Substrate)
    ctx.fillStyle = '#0f172a'; // Slate 900 (Si substrate)
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const depth = lattice[0][0].length;

    // 2. Grid / Waveguide Paths
    if (showBorders) {
        ctx.strokeStyle = '#334155'; // Slate 700
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= SIZE; i++) {
            const p = Math.floor(i * CELL_SIZE) + 0.5;
            ctx.moveTo(0, p); ctx.lineTo(CANVAS_SIZE, p);
            ctx.moveTo(p, 0); ctx.lineTo(p, CANVAS_SIZE);
        }
        ctx.stroke();
    }

    // 3. Cells (Resonators)
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const stack = lattice[i][j];
            let activeLayers = 0;
            for(let k = 0; k < depth; k++) {
                if(stack[k] === 1) activeLayers++;
            }

            const gateType = kernelFace[i][j];
            const x = j * CELL_SIZE;
            const y = i * CELL_SIZE;
            
            // Render "Socket" / Inactive Resonator
            ctx.fillStyle = '#1e293b'; // Dark waveguide slot
            const pad = 2;
            ctx.fillRect(x + pad, y + pad, CELL_SIZE - pad*2, CELL_SIZE - pad*2);

            if (activeLayers > 0) {
                // Active State: SiNi/LiNbO3 Mode
                const intensity = activeLayers / depth;
                
                // Use distinct colors based on gate type for debugging/engineering view
                // But keep them technical (less neon)
                const techColor = COLORS[gateType]; 

                // Draw solid active block (Mode Volume)
                ctx.fillStyle = techColor;
                const activeSize = (CELL_SIZE - pad*2) * 0.9;
                const offset = (CELL_SIZE - activeSize) / 2;
                ctx.fillRect(x + offset, y + offset, activeSize, activeSize);
                
                // Draw inner brightness (Peak Intensity)
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.4 + (intensity * 0.6);
                const coreSize = activeSize * 0.4;
                const coreOffset = (CELL_SIZE - coreSize) / 2;
                ctx.fillRect(x + coreOffset, y + coreOffset, coreSize, coreSize);
                ctx.globalAlpha = 1.0;
            } else {
                // Label gate type subtly
                ctx.fillStyle = '#334155';
                const markerSize = 4;
                ctx.fillRect(x + CELL_SIZE/2 - markerSize/2, y + CELL_SIZE/2 - markerSize/2, markerSize, markerSize);
            }
        }
    }

    // 4. Interconnects (Bus Waveguides)
    if (interconnects) {
        ctx.lineWidth = 3;
        const busColor = INTERCONNECT_ACTIVE_COLOR;

        // Rows
        interconnects.rows.forEach((isActive, index) => {
            if (isActive) {
                const y = (INTERCONNECT_CHANNELS[index] + 0.5) * CELL_SIZE;
                ctx.strokeStyle = busColor;
                ctx.globalAlpha = 0.8;
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_SIZE, y); ctx.stroke();
            }
        });

        // Cols
        interconnects.cols.forEach((isActive, index) => {
            if (isActive) {
                const x = (INTERCONNECT_CHANNELS[index] + 0.5) * CELL_SIZE;
                ctx.strokeStyle = busColor;
                ctx.globalAlpha = 0.8;
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_SIZE); ctx.stroke();
            }
        });
        ctx.globalAlpha = 1.0;
    }

  }, [lattice, kernelFace, showBorders, interconnects]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    const i = Math.floor(y / CELL_SIZE);
    const j = Math.floor(x / CELL_SIZE);
    if (i >= 0 && i < SIZE && j >= 0 && j < SIZE) {
      onCellClick(i, j, 1);
    }
  };

  return (
    <div style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }} className="mx-auto block max-w-full h-auto border border-slate-700 bg-slate-900 rounded-sm overflow-hidden">
        <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onClick={handleClick}
            style={{ cursor: 'crosshair' }}
            aria-label="Schematic View of Photonic Lattice"
        />
    </div>
  );
};
