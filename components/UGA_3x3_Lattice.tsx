import React, { useRef, useEffect } from 'react';
import { GATE_NAMES, COLORS, INACTIVE_COLORS } from '../constants';
import type { Lattice3D } from '../types';

interface UGA3x3LatticeProps {
  coreGrid: number[][]; // This is the gate type grid
  lattice: Lattice3D;
}

const CELL_SIZE = 80;
const PADDING = 10;
const GRID_SIZE = 3 * CELL_SIZE;
const CANVAS_SIZE = GRID_SIZE + PADDING * 2;


export const UGA_3x3_Lattice: React.FC<UGA3x3LatticeProps> = ({ coreGrid, lattice }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (!lattice || !lattice[0] || !lattice[0][0]) return;
    const depth = lattice[0][0].length;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const gateType = coreGrid[i][j];
          const x = PADDING + j * CELL_SIZE;
          const y = PADDING + i * CELL_SIZE;
          
          const latticeI = i + 3;
          const latticeJ = j + 3;

          // Draw cell background
          ctx.fillStyle = INACTIVE_COLORS[gateType] || '#020617';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          
          // Draw layers from bottom (k=depth-1) to top (k=0)
          for (let k = depth - 1; k >= 0; k--) {
            if (lattice[latticeI][latticeJ][k] === 1) {
                const sizeFactor = 0.9 - (depth - 1 - k) * 0.25;
                const layerCellSize = CELL_SIZE * sizeFactor;
                const offset = (CELL_SIZE - layerCellSize) / 2;

                ctx.fillStyle = COLORS[gateType];
                ctx.fillRect(x + offset, y + offset, layerCellSize, layerCellSize);
            }
          }

          // Draw Border after layers so it's on top.
          ctx.strokeStyle = '#334155'; // slate-700
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

          // Draw Text Label
          ctx.fillStyle = 'rgba(229, 231, 235, 0.7)'; // gray-200 with opacity
          ctx.font = 'bold 14px "Orbitron"';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const gateName = GATE_NAMES[gateType] || 'N/A';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 5;
          ctx.fillText(gateName, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
          ctx.shadowBlur = 0;
        }
      }
    };

    render();
    
  }, [coreGrid, lattice]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="max-w-full max-h-full"
          aria-label="3x3 Unified Gate Array visualization showing the state of the central 3x3 module"
        />
    </div>
  );
};