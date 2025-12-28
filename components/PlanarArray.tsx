
import React, { useRef, useEffect } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, COLORS, INTERCONNECT_CHANNELS, DEPTH } from '../constants';

interface PlanarArrayProps {
  lattice: Lattice3D;
  kernelFace: number[][];
  onCellClick: (i: number, j: number, k: number) => void;
  showBorders: boolean;
  interconnects: { rows: boolean[]; cols: boolean[]; };
}

const CANVAS_SIZE = 540;
const CELL_SIZE = CANVAS_SIZE / SIZE;

export const PlanarArray: React.FC<PlanarArrayProps> = (props) => {
  const { lattice, kernelFace, onCellClick, showBorders, interconnects } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let tick = 0;
    const render = () => {
      tick += 0.05;
      const pulse = (Math.sin(tick) + 1) / 2;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      if (showBorders) {
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= SIZE; i++) {
          const p = Math.floor(i * CELL_SIZE) + 0.5;
          ctx.moveTo(0, p); ctx.lineTo(CANVAS_SIZE, p);
          ctx.moveTo(p, 0); ctx.lineTo(p, CANVAS_SIZE);
        }
        ctx.stroke();
      }

      for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
          let activeLayers = 0;
          for (let k = 0; k < DEPTH; k++) {
              if (lattice[(i * SIZE * DEPTH) + (j * DEPTH) + k] === 1) activeLayers++;
          }

          if (activeLayers > 0) {
            const gateType = kernelFace[i][j];
            const techColor = COLORS[gateType];
            const x = j * CELL_SIZE;
            const y = i * CELL_SIZE;
            
            ctx.shadowColor = techColor;
            ctx.shadowBlur = 4 + pulse * 8;
            ctx.fillStyle = techColor;
            
            const activeSize = CELL_SIZE * 0.8;
            const offset = (CELL_SIZE - activeSize) / 2;
            
            ctx.globalAlpha = 0.7 + (activeLayers / DEPTH) * 0.3;
            ctx.fillRect(x + offset, y + offset, activeSize, activeSize);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.2 + (pulse * 0.3);
            const coreSize = activeSize * 0.4;
            ctx.fillRect(x + (CELL_SIZE - coreSize) / 2, y + (CELL_SIZE - coreSize) / 2, coreSize, coreSize);
            ctx.globalAlpha = 1.0;
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [lattice, kernelFace, showBorders, interconnects]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    onCellClick(Math.floor(y / CELL_SIZE), Math.floor(x / CELL_SIZE), Math.floor(DEPTH / 2));
  };

  return (
    <div className="component-panel p-2 rounded-sm bg-slate-900 border-slate-800 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={handleClick}
        className="cursor-crosshair block"
      />
    </div>
  );
};
