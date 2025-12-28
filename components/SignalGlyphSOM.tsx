
import React, { useRef, useEffect } from 'react';
import type { GlyphMapData } from '../types';

interface SignalGlyphSOMProps {
  map: GlyphMapData;
  bmu: { x: number; y: number } | null;
  currentInput: number[];
  iteration: number;
}

const MAP_DIM = 10;
const NODE_SIZE = 32;
const NODE_PADDING = 8;
const GRID_SIZE = 3;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

export const SignalGlyphSOM: React.FC<SignalGlyphSOMProps> = ({ map, bmu, iteration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const startX = (CANVAS_WIDTH - (MAP_DIM * (NODE_SIZE + NODE_PADDING))) / 2;
      const startY = (CANVAS_HEIGHT - (MAP_DIM * (NODE_SIZE + NODE_PADDING))) / 2;
      ctx.globalCompositeOperation = 'screen';

      map.forEach((row, i) => {
        row.forEach((node, j) => {
          const nx = startX + j * (NODE_SIZE + NODE_PADDING);
          const ny = startY + i * (NODE_SIZE + NODE_PADDING);
          const isBMU = bmu && bmu.x === i && bmu.y === j;
          const distToBMU = bmu ? Math.sqrt((bmu.x - i) ** 2 + (bmu.y - j) ** 2) : 10;
          const bmuInfluence = Math.exp(-distToBMU / 2);

          const spacing = NODE_SIZE / (GRID_SIZE + 1);
          for (let gy = 0; gy < GRID_SIZE; gy++) {
            for (let gx = 0; gx < GRID_SIZE; gx++) {
              const weightIdx = (gy * GRID_SIZE + gx) * 9;
              const weightVal = node.weights[weightIdx] || 0;
              const dx = nx + (gx + 1) * spacing;
              const dy = ny + (gy + 1) * spacing;
              const intensity = weightVal * 0.8 + bmuInfluence * 0.2;
              
              if (intensity > 0.3) {
                  ctx.fillStyle = isBMU ? '#ffffff' : `rgba(34, 211, 238, ${0.2 + intensity * 0.6})`;
                  ctx.beginPath();
                  ctx.arc(dx, dy, 2 * (1 + (isBMU ? 0.5 : 0)), 0, Math.PI * 2);
                  ctx.fill();
              }
            }
          }

          ctx.strokeStyle = isBMU ? '#fff' : `rgba(34, 211, 238, ${0.1 + bmuInfluence * 0.3})`;
          ctx.lineWidth = isBMU ? 1.5 : 0.5;
          ctx.strokeRect(nx, ny, NODE_SIZE, NODE_SIZE);
        });
      });

      ctx.globalCompositeOperation = 'source-over';
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [map, bmu, iteration]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950 rounded-sm overflow-hidden border border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] relative group">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="max-w-full h-auto" />
    </div>
  );
};
