
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

export const CyclicManifold: React.FC<CyclicManifoldProps> = (props) => {
  const { lattice, kernelFace, onCellClick, showBorders, interconnects } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // --- RENDER PIPELINE ---

    // 1. Temporal Fade (The "Trail" Effect)
    // Instead of ctx.clearRect, we draw a semi-transparent rectangle over the previous frame.
    // This creates the motion blur/trail effect essential for high-speed visualization.
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(2, 6, 23, 0.25)'; // Very dark slate with low opacity
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const depth = lattice[0][0].length;

    // 2. Draw Grid (Base Structure)
    if (showBorders) {
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)'; // Subtle grid
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= SIZE; i++) {
            const p = Math.floor(i * CELL_SIZE) + 0.5; // Snap to pixel grid
            ctx.moveTo(0, p); ctx.lineTo(CANVAS_SIZE, p);
            ctx.moveTo(p, 0); ctx.lineTo(p, CANVAS_SIZE);
        }
        ctx.stroke();
    }

    // 3. Draw Cells (Additive Light Layer)
    // We use 'lighter' composite operation to simulate light adding up.
    ctx.globalCompositeOperation = 'lighter';

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
            const cx = x + CELL_SIZE / 2;
            const cy = y + CELL_SIZE / 2;

            if (activeLayers > 0) {
                // -- Active Cell Styling --
                const intensity = activeLayers / depth;
                const baseColor = COLORS[gateType] || '#fff';
                
                // A. The Glow (Halo)
                ctx.shadowBlur = 15;
                ctx.shadowColor = baseColor;
                ctx.fillStyle = baseColor;
                
                // Draw the main body
                const bodySize = CELL_SIZE * 0.85;
                const offset = (CELL_SIZE - bodySize) / 2;
                ctx.fillRect(x + offset, y + offset, bodySize, bodySize);

                // B. The "Hot Core" (White center indicates high energy)
                // This makes it readable even when moving fast
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffffff';
                const coreSize = bodySize * (0.3 + intensity * 0.4);
                const coreOffset = (CELL_SIZE - coreSize) / 2;
                ctx.fillRect(x + coreOffset, y + coreOffset, coreSize, coreSize);

            } else {
                // -- Inactive Cell Styling (Structure) --
                // Switch back to source-over for non-glowing elements to avoid blowing out the image
                ctx.globalCompositeOperation = 'source-over';
                
                const inactiveColor = INACTIVE_COLORS[gateType] || '#111';
                ctx.fillStyle = inactiveColor;
                
                // Draw a small "socket" or "via" to show potential connectivity
                const socketSize = 4;
                ctx.fillRect(cx - socketSize/2, cy - socketSize/2, socketSize, socketSize);
                
                // Restore additive for next active cell
                ctx.globalCompositeOperation = 'lighter';
            }
        }
    }

    // 4. Draw Interconnects (Laser Beams)
    // Drawn on top with high intensity
    if (interconnects) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'butt';

        // Rows (Horizontal Lasers)
        interconnects.rows.forEach((isActive, index) => {
            if (isActive) {
                const y = (INTERCONNECT_CHANNELS[index] + 0.5) * CELL_SIZE;
                
                // Outer Glow
                ctx.strokeStyle = 'rgba(255, 0, 255, 0.4)';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ff00ff';
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_SIZE, y); ctx.stroke();

                // Inner Beam (White hot)
                ctx.strokeStyle = '#fff';
                ctx.shadowBlur = 2;
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_SIZE, y); ctx.stroke();
            }
        });

        // Cols (Vertical Lasers)
        interconnects.cols.forEach((isActive, index) => {
            if (isActive) {
                const x = (INTERCONNECT_CHANNELS[index] + 0.5) * CELL_SIZE;
                
                // Outer Glow
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00ffff';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_SIZE); ctx.stroke();

                // Inner Beam
                ctx.strokeStyle = '#fff';
                ctx.shadowBlur = 2;
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_SIZE); ctx.stroke();
            }
        });
    }

    // Reset Context
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';

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
    <div style={{ position: 'relative', width: CANVAS_SIZE, height: CANVAS_SIZE }} className="mx-auto block max-w-full h-auto shadow-2xl shadow-cyan-900/20 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
        <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
            aria-label="High-Velocity Cyclic Manifold Visualization"
        />
        {/* Subtle overlay vignette for depth */}
        <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(circle at center, transparent 60%, rgba(2, 6, 23, 0.6) 100%)'
        }}></div>
    </div>
  );
};
    