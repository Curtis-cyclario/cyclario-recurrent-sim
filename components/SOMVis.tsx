import React, { useRef, useEffect } from 'react';
import type { SOMMap } from '../types';
import { SIZE, DEPTH } from '../constants';

interface SOMVisProps {
  map: SOMMap;
  bmu: { x: number; y: number } | null;
  currentInput: number[];
  iteration: number;
}

const GLYPH_SIZE = 5; // Render a 5x5 glyph from the 9x9 weights
const CELL_RENDER_SIZE = 30;
const PADDING = 5;
const MAP_DIMENSION = 10;
const MAP_RENDER_SIZE = MAP_DIMENSION * (CELL_RENDER_SIZE + PADDING);
const INPUT_RENDER_SIZE = 120;
const CANVAS_WIDTH = MAP_RENDER_SIZE + INPUT_RENDER_SIZE + 80;
const ANIMATION_DURATION = 300; // ms

// --- Drawing Function ---
const drawGlyph = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, weights: number[], prevWeights: number[] | null, progress: number) => {
  if (!weights || weights.length === 0) return;
  
  const get2DGrid = (w: number[]) => {
    const grid: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            let depthSum = 0;
            for (let k = 0; k < DEPTH; k++) {
                const index = i * SIZE * DEPTH + j * DEPTH + k;
                if (index < w.length) depthSum += w[index];
            }
            grid[i][j] = DEPTH > 0 ? depthSum / DEPTH : 0;
        }
    }
    return grid;
  }
  
  const downsample = (grid: number[][]) => {
    const downsampledGrid: number[][] = Array.from({ length: GLYPH_SIZE }, () => Array(GLYPH_SIZE).fill(0));
    const ratioX = SIZE / GLYPH_SIZE;
    const ratioY = SIZE / GLYPH_SIZE;

    for (let gy = 0; gy < GLYPH_SIZE; gy++) {
        for (let gx = 0; gx < GLYPH_SIZE; gx++) {
            let sum = 0, count = 0;
            const startX = Math.floor(gx * ratioX), endX = Math.floor((gx + 1) * ratioX);
            const startY = Math.floor(gy * ratioY), endY = Math.floor((gy + 1) * ratioY);
            for (let i = startY; i < endY; i++) {
                for (let j = startX; j < endX; j++) {
                    sum += grid[i][j];
                    count++;
                }
            }
            downsampledGrid[gy][gx] = count > 0 ? sum / count : 0;
        }
    }
    return downsampledGrid;
  };

  const currentGrid = downsample(get2DGrid(weights));
  const prevGrid = prevWeights ? downsample(get2DGrid(prevWeights)) : currentGrid;

  const pixelSize = size / GLYPH_SIZE;
  for (let gy = 0; gy < GLYPH_SIZE; gy++) {
    for (let gx = 0; gx < GLYPH_SIZE; gx++) {
      const prevValue = prevGrid[gy][gx];
      const currValue = currentGrid[gy][gx];
      const interpolatedValue = prevValue + (currValue - prevValue) * progress;
      const value = Math.max(0, Math.min(1, interpolatedValue));
      
      ctx.fillStyle = `rgba(0, 255, 204, ${value * 0.9})`;
      ctx.fillRect(x + gx * pixelSize, y + gy * pixelSize, pixelSize, pixelSize);
    }
  }
};

export const SOMVis: React.FC<SOMVisProps> = ({ map, bmu, currentInput, iteration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationState = useRef({
      startTime: 0,
      frameId: 0,
      prevMap: map,
      prevBmu: bmu
  });

  useEffect(() => {
    animationState.current.prevMap = animationState.current.prevMap || map;
    animationState.current.startTime = Date.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const H = canvas.height;
      ctx.clearRect(0, 0, canvas.width, H);

      const elapsed = Date.now() - animationState.current.startTime;
      const progress = Math.min(1, elapsed / ANIMATION_DURATION);

      // 1. Draw Input Pattern
      const inputX = 30;
      const inputY = H / 2 - INPUT_RENDER_SIZE / 2;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(inputX - 1, inputY - 1, INPUT_RENDER_SIZE + 2, INPUT_RENDER_SIZE + 2);
      drawGlyph(ctx, inputX, inputY, INPUT_RENDER_SIZE, currentInput, null, 1);
      ctx.font = '14px "Orbitron"';
      ctx.fillStyle = '#67e8f9';
      ctx.textAlign = 'center';
      ctx.fillText('Input', inputX + INPUT_RENDER_SIZE / 2, inputY - 20);
      ctx.font = '10px "Roboto Mono"';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Iteration: ${iteration}`, inputX + INPUT_RENDER_SIZE / 2, inputY + INPUT_RENDER_SIZE + 20);

      // 2. Draw Map
      const mapStartX = inputX + INPUT_RENDER_SIZE + 50;
      const mapStartY = H / 2 - MAP_RENDER_SIZE / 2;
      map.forEach((row, i) => {
        row.forEach((node, j) => {
          const cellX = mapStartX + j * (CELL_RENDER_SIZE + PADDING);
          const cellY = mapStartY + i * (CELL_RENDER_SIZE + PADDING);
          const prevNode = animationState.current.prevMap[i]?.[j];
          
          ctx.strokeStyle = '#1e293b';
          ctx.strokeRect(cellX, cellY, CELL_RENDER_SIZE, CELL_RENDER_SIZE);
          drawGlyph(ctx, cellX, cellY, CELL_RENDER_SIZE, node.weights, prevNode?.weights || null, progress);
        });
      });
      
      // 3. Highlight BMU and draw connecting line
      if (bmu) {
        const bmuX = mapStartX + bmu.y * (CELL_RENDER_SIZE + PADDING);
        const bmuY = mapStartY + bmu.x * (CELL_RENDER_SIZE + PADDING);
        
        // Pulsing highlight
        const pulseProgress = (elapsed % 500) / 500; // 0.5s pulse cycle
        const pulseRadius = CELL_RENDER_SIZE / 2 + pulseProgress * 8;
        const pulseOpacity = (1 - pulseProgress) * 0.7;

        ctx.strokeStyle = `rgba(0, 170, 255, ${pulseOpacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bmuX + CELL_RENDER_SIZE/2, bmuY + CELL_RENDER_SIZE/2, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw line from input to BMU
        ctx.beginPath();
        ctx.moveTo(inputX + INPUT_RENDER_SIZE, inputY + INPUT_RENDER_SIZE/2);
        ctx.lineTo(bmuX, bmuY + CELL_RENDER_SIZE/2);
        ctx.strokeStyle = '#00aaff';
        ctx.stroke();
      }

      if (progress < 1 || bmu) { // Keep animating if progress < 1 or if there's a BMU to pulse
          animationState.current.frameId = requestAnimationFrame(render);
      }

      // FIX: The progress variable was out of scope. Moved this logic inside the render function.
      // Update previous map for next render cycle
      if (progress >= 1) {
        animationState.current.prevMap = map;
      }
    };

    if(animationState.current.frameId) cancelAnimationFrame(animationState.current.frameId);
    animationState.current.frameId = requestAnimationFrame(render);

    return () => {
        if(animationState.current.frameId) cancelAnimationFrame(animationState.current.frameId);
    };

  }, [map, bmu, currentInput, iteration]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={400}
        className="max-w-full max-h-full"
        aria-label="Self-Organizing Map visualization"
      />
    </div>
  );
};
