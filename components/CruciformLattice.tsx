import React, { useRef, useEffect } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, DEPTH, COLORS, INACTIVE_COLORS, INTERCONNECT_CHANNELS } from '../constants';

interface CruciformLatticeProps {
  lattice: Lattice3D;
  kernelFace: number[][];
  onCellClick: (i: number, j: number, k: number) => void;
  showBorders: boolean;
  interconnects: { rows: boolean[]; cols: boolean[]; };
}

const CANVAS_SIZE = 540;
const CELL_SIZE = CANVAS_SIZE / SIZE;

export const CruciformLattice: React.FC<CruciformLatticeProps> = ({ lattice, kernelFace, onCellClick, showBorders, interconnects }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw cells
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const isActive = lattice[i][j].some(state => state === 1);
        const gateType = kernelFace[i][j];
        const x = j * CELL_SIZE;
        const y = i * CELL_SIZE;

        if (isActive) {
            ctx.fillStyle = COLORS[gateType];
            ctx.shadowColor = COLORS[gateType];
            ctx.shadowBlur = 10;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = INACTIVE_COLORS[gateType];
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw borders if enabled
    if (showBorders) {
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      for(let i = 0; i <= SIZE; i++){
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }
      for(let j = 0; j <= SIZE; j++){
        ctx.beginPath();
        ctx.moveTo(j * CELL_SIZE, 0);
        ctx.lineTo(j * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
      }
    }

    // Draw Interconnects
    if (interconnects) {
        ctx.lineWidth = 1.5;
        interconnects.rows.forEach((isActive, index) => {
            if (isActive) {
                const y = (INTERCONNECT_CHANNELS[index] + 0.5) * CELL_SIZE;
                ctx.strokeStyle = 'rgba(255, 100, 255, 0.5)';
                ctx.shadowColor = '#ff64ff';
                ctx.shadowBlur = 6;
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_SIZE, y); ctx.stroke();
            }
        });
        interconnects.cols.forEach((isActive, index) => {
            if (isActive) {
                const x = (INTERCONNECT_CHANNELS[index] + 0.5) * CELL_SIZE;
                ctx.strokeStyle = 'rgba(100, 255, 255, 0.5)';
                 ctx.shadowColor = '#64ffff';
                ctx.shadowBlur = 6;
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_SIZE); ctx.stroke();
            }
        });
        ctx.shadowBlur = 0;
    }

  }, [lattice, kernelFace, showBorders, interconnects]); // Redraw whenever props change

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const i = Math.floor(y / CELL_SIZE);
    const j = Math.floor(x / CELL_SIZE);
    const k = 1; // Always toggle the middle layer

    if (i >= 0 && i < SIZE && j >= 0 && j < SIZE) {
      onCellClick(i, j, k);
    }
  };

  return (
    <div style={{ position: 'relative', width: CANVAS_SIZE, height: CANVAS_SIZE }} className="mx-auto block max-w-full h-auto">
        <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
            aria-label="9x9x3 overlayed lattice automaton visualization"
        />
    </div>
  );
};
