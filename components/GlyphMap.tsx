
import React, { useRef, useEffect } from 'react';
import type { GlyphMapData } from '../types';

interface GlyphMapProps {
  map: GlyphMapData;
  bmu: { x: number; y: number } | null;
  currentInput: number[];
  iteration: number;
}

const MAP_DIM = 10;
const NODE_SIZE = 32;
const NODE_PADDING = 8;
const GRID_SIZE = 3; // Inner glyph resolution (3x3)
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

export const GlyphMap: React.FC<GlyphMapProps> = ({ map, bmu, iteration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Initializing with undefined to satisfy strict "useRef" argument requirements
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.02;
      
      // 1. Phosphor Persistence Effect
      // Instead of clearing, we draw a semi-transparent black rect to create trails
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const startX = (CANVAS_WIDTH - (MAP_DIM * (NODE_SIZE + NODE_PADDING))) / 2;
      const startY = (CANVAS_HEIGHT - (MAP_DIM * (NODE_SIZE + NODE_PADDING))) / 2;

      ctx.globalCompositeOperation = 'screen';

      // 2. Draw Topological Tethers (Lattice Connections)
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < MAP_DIM; i++) {
        for (let j = 0; j < MAP_DIM; j++) {
          const x = startX + j * (NODE_SIZE + NODE_PADDING) + NODE_SIZE / 2;
          const y = startY + i * (NODE_SIZE + NODE_PADDING) + NODE_SIZE / 2;
          
          if (j < MAP_DIM - 1) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + NODE_SIZE + NODE_PADDING, y);
            ctx.stroke();
          }
          if (i < MAP_DIM - 1) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + NODE_SIZE + NODE_PADDING);
            ctx.stroke();
          }
        }
      }

      // 3. Draw Glyphs
      map.forEach((row, i) => {
        row.forEach((node, j) => {
          const nx = startX + j * (NODE_SIZE + NODE_PADDING);
          const ny = startY + i * (NODE_SIZE + NODE_PADDING);
          
          const isBMU = bmu && bmu.x === i && bmu.y === j;
          const distToBMU = bmu ? Math.sqrt((bmu.x - i) ** 2 + (bmu.y - j) ** 2) : 10;
          const bmuInfluence = Math.exp(-distToBMU / 2);

          // Render inner 3x3 weight representation
          const dotSize = 2;
          const spacing = NODE_SIZE / (GRID_SIZE + 1);
          
          for (let gy = 0; gy < GRID_SIZE; gy++) {
            for (let gx = 0; gx < GRID_SIZE; gx++) {
              // Sample weights for this region
              const weightIdx = (gy * GRID_SIZE + gx) * 9; // Rough mapping
              const weightVal = node.weights[weightIdx] || 0;
              
              const dx = nx + (gx + 1) * spacing;
              const dy = ny + (gy + 1) * spacing;
              
              const intensity = weightVal * 0.8 + bmuInfluence * 0.2;
              const glow = isBMU ? 1 : bmuInfluence * 0.5;

              ctx.fillStyle = isBMU ? '#ffffff' : `rgba(34, 211, 238, ${0.2 + intensity * 0.6})`;
              
              if (intensity > 0.3) {
                  ctx.beginPath();
                  ctx.arc(dx, dy, dotSize * (1 + glow), 0, Math.PI * 2);
                  ctx.fill();
                  
                  if (isBMU || glow > 0.4) {
                      ctx.shadowColor = '#22d3ee';
                      ctx.shadowBlur = 5 * glow;
                      ctx.fill();
                      ctx.shadowBlur = 0;
                  }
              }
            }
          }

          // Node Frame
          ctx.strokeStyle = isBMU ? '#fff' : `rgba(34, 211, 238, ${0.1 + bmuInfluence * 0.3})`;
          ctx.lineWidth = isBMU ? 1.5 : 0.5;
          ctx.strokeRect(nx, ny, NODE_SIZE, NODE_SIZE);
          
          if (isBMU) {
              // BMU Radiant Pulse
              const pulse = (Math.sin(time * 10) + 1) / 2;
              ctx.strokeStyle = `rgba(255, 255, 255, ${1 - pulse})`;
              ctx.strokeRect(nx - pulse * 10, ny - pulse * 10, NODE_SIZE + pulse * 20, NODE_SIZE + pulse * 20);
          }
        });
      });

      ctx.globalCompositeOperation = 'source-over';

      // 4. HUD Overlays
      ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
      ctx.font = '900 10px "Orbitron"';
      ctx.textAlign = 'left';
      ctx.fillText(`SIGNAL_ITERATION: ${iteration.toString().padStart(6, '0')}`, 30, CANVAS_HEIGHT - 30);
      
      if (bmu) {
          ctx.textAlign = 'right';
          ctx.fillText(`BMU_LOCK: [${bmu.x}, ${bmu.y}]`, CANVAS_WIDTH - 30, CANVAS_HEIGHT - 30);
      }

      // Scanner Line
      const scanY = (Math.sin(time * 0.5) * 0.5 + 0.5) * CANVAS_HEIGHT;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(CANVAS_WIDTH, scanY); ctx.stroke();

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [map, bmu, iteration]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950 rounded-sm overflow-hidden border border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] relative group">
      <div className="absolute top-4 left-6 hud-label text-[7px] opacity-30 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
          <span>LATENT_SPACE_CLUSTERING: ENABLED</span>
          <span>DIM_REDUCTION: SOM_MAP_10x10</span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full h-auto"
        aria-label="Persistent Signal Field: Self-Organizing Map Visualization"
      />
    </div>
  );
};
