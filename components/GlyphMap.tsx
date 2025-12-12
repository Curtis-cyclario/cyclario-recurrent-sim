
import React, { useRef, useEffect } from 'react';
import type { GlyphMapData } from '../types';

interface GlyphMapProps {
  map: GlyphMapData;
  bmu: { x: number; y: number } | null;
  currentInput: number[];
  iteration: number;
}

const CELL_RENDER_SIZE = 25;
const PADDING = 4;
const MAP_DIM = 10;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 350;

export const GlyphMap: React.FC<GlyphMapProps> = ({ map, bmu, currentInput, iteration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw Map
    const startX = 50;
    const startY = 20;

    map.forEach((row, i) => {
      row.forEach((node, j) => {
        const x = startX + j * (CELL_RENDER_SIZE + PADDING);
        const y = startY + i * (CELL_RENDER_SIZE + PADDING);
        
        // Visualize weight average as brightness
        const avgWeight = node.weights.reduce((a,b)=>a+b,0) / node.weights.length;
        const brightness = Math.floor(avgWeight * 255);
        
        ctx.fillStyle = `rgb(0, ${brightness}, ${Math.max(100, brightness)})`;
        ctx.fillRect(x, y, CELL_RENDER_SIZE, CELL_RENDER_SIZE);
        
        if (bmu && bmu.x === i && bmu.y === j) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, CELL_RENDER_SIZE, CELL_RENDER_SIZE);
        }
      });
    });

    ctx.fillStyle = '#aaa';
    ctx.font = '12px "Roboto Mono"';
    ctx.fillText(`Iteration: ${iteration}`, 10, CANVAS_HEIGHT - 10);

  }, [map, bmu, iteration]);

  return (
    <div className="flex justify-center p-4">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="max-w-full" aria-label="Glyph Map (SOM)" />
    </div>
  );
};
