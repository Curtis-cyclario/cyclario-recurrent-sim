
import React, { useRef, useEffect } from 'react';
import { GATE_NAMES, COLORS, INACTIVE_COLORS, DEPTH, SIZE } from '../constants';
import type { Lattice3D } from '../types';

interface KernelProcessorProps {
  coreGrid: number[][];
  lattice: Lattice3D;
}

const CELL_SIZE = 80;
const PADDING = 10;
const CANVAS_SIZE = (3 * CELL_SIZE) + PADDING * 2;

export const KernelProcessor: React.FC<KernelProcessorProps> = ({ coreGrid, lattice }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const gateType = coreGrid[i][j];
        const x = PADDING + j * CELL_SIZE;
        const y = PADDING + i * CELL_SIZE;
        
        const latI = i + 3;
        const latJ = j + 3;

        ctx.fillStyle = INACTIVE_COLORS[gateType] || '#020617';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        for (let k = DEPTH - 1; k >= 0; k--) {
          if (lattice[(latI * SIZE * DEPTH) + (latJ * DEPTH) + k] === 1) {
              const sizeFactor = 0.9 - (DEPTH - 1 - k) * 0.12;
              const layerCellSize = CELL_SIZE * sizeFactor;
              ctx.fillStyle = COLORS[gateType];
              ctx.globalAlpha = 0.4 + (k / DEPTH) * 0.6;
              ctx.fillRect(x + (CELL_SIZE - layerCellSize) / 2, y + (CELL_SIZE - layerCellSize) / 2, layerCellSize, layerCellSize);
          }
        }
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '800 10px "Orbitron"';
        ctx.textAlign = 'center';
        ctx.fillText(GATE_NAMES[gateType] || '?', x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 4);
      }
    }
  }, [coreGrid, lattice]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="hud-label mb-4 opacity-50 font-orbitron">CORE_KERNEL_PROCESSING_UNIT</div>
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="max-w-full max-h-full" />
    </div>
  );
};
