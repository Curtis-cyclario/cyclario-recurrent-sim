
import React, { useRef, useEffect } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, DEPTH, COLORS } from '../constants';

interface PatternGeneratorVisProps {
  lattice: Lattice3D;
  kernelFace: number[][];
}

const CANVAS_SIZE = 540;
const CELL_SIZE = CANVAS_SIZE / SIZE;

const TRAIL_LENGTH = 20;
const FADE_OUT_DURATION = 800; // ms

export const PatternGeneratorVis: React.FC<PatternGeneratorVisProps> = ({ lattice, kernelFace }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const historyRef = useRef<{ lattice: Lattice3D; timestamp: number }[]>([]);

  useEffect(() => {
    const history = historyRef.current;
    history.push({ lattice: new Uint8Array(lattice), timestamp: Date.now() });
    if (history.length > TRAIL_LENGTH) {
      history.shift();
    }
  }, [lattice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const history = historyRef.current;

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const currentTime = Date.now();

      history.forEach((histEntry) => {
        const { lattice: histLattice, timestamp } = histEntry;
        const age = currentTime - timestamp;
        if (age >= FADE_OUT_DURATION) return;

        const opacity = 1 - age / FADE_OUT_DURATION;

        for (let i = 0; i < SIZE; i++) {
          for (let j = 0; j < SIZE; j++) {
            let activeLayers = 0;
            for (let k = 0; k < DEPTH; k++) {
              if (histLattice[(i * SIZE * DEPTH) + (j * DEPTH) + k] === 1) {
                activeLayers++;
              }
            }
            if (activeLayers > 0) {
              const gateType = kernelFace[i][j];
              const baseColor = COLORS[gateType] || '#ffffff';
              const x = j * CELL_SIZE;
              const y = i * CELL_SIZE;

              ctx.globalAlpha = opacity * 0.5 * (activeLayers / DEPTH);
              ctx.fillStyle = baseColor;
              ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }
          }
        }
      });

      ctx.globalAlpha = 1.0;
      const currentLatticeState = history[history.length - 1]?.lattice;
      if (currentLatticeState) {
        for (let i = 0; i < SIZE; i++) {
          for (let j = 0; j < SIZE; j++) {
            let activeLayers = 0;
            for (let k = 0; k < DEPTH; k++) {
              if (currentLatticeState[(i * SIZE * DEPTH) + (j * DEPTH) + k] === 1) {
                activeLayers++;
              }
            }

            if (activeLayers > 0) {
              const gateType = kernelFace[i][j];
              const baseColor = COLORS[gateType] || '#ffffff';
              const x = j * CELL_SIZE;
              const y = i * CELL_SIZE;

              ctx.shadowColor = baseColor;
              ctx.shadowBlur = 10;
              ctx.fillStyle = 'white';
              const coreSize = CELL_SIZE * 0.4;
              ctx.fillRect(x + (CELL_SIZE - coreSize) / 2, y + (CELL_SIZE - coreSize) / 2, coreSize, coreSize);
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);
    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [kernelFace]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="max-w-full max-h-full" />
    </div>
  );
};
