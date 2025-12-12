import React, { useRef, useEffect } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, DEPTH, INTERCONNECT_CHANNELS } from '../constants';

interface NeuralLinkVisProps {
  lattice: Lattice3D;
  prevLattice: Lattice3D;
  interconnects: { rows: boolean[]; cols: boolean[]; };
}

const CANVAS_SIZE = 540;
const CELL_SIZE = CANVAS_SIZE / SIZE;

export const NeuralLinkVis: React.FC<NeuralLinkVisProps> = ({ lattice, prevLattice, interconnects }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Clear canvas
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Find all currently active cell coordinates (2D projection)
    const activeCells = [];
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            let activeLayers = 0;
            for (let k = 0; k < DEPTH; k++) {
                if (lattice[i][j][k] === 1) {
                    activeLayers++;
                }
            }
            if (activeLayers > 0) {
                activeCells.push({ i, j, activeLayers });
            }
        }
    }

    // 3. Draw local links
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.3)';
    ctx.lineWidth = 0.75;
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 4;

    activeCells.forEach(cell => {
        const { i, j } = cell;
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;

                const ni = (i + di + SIZE) % SIZE;
                const nj = (j + dj + SIZE) % SIZE;

                let neighborWasActive = false;
                for (let k = 0; k < DEPTH; k++) {
                    if (prevLattice[ni][nj][k] === 1) {
                        neighborWasActive = true;
                        break;
                    }
                }

                if (neighborWasActive) {
                    ctx.beginPath();
                    ctx.moveTo( (j + 0.5) * CELL_SIZE, (i + 0.5) * CELL_SIZE );
                    ctx.lineTo( (nj + 0.5) * CELL_SIZE, (ni + 0.5) * CELL_SIZE );
                    ctx.stroke();
                }
            }
        }
    });
    
    // 4. Draw Interconnect links
    // Row Interconnects
    interconnects.rows.forEach((isActive, index) => {
        if (isActive) {
            const i = INTERCONNECT_CHANNELS[index];
            const y = (i + 0.5) * CELL_SIZE;
            const activeCols = activeCells.filter(c => c.i === i).map(c => c.j).sort((a,b) => a-b);
            if (activeCols.length > 1) {
                ctx.strokeStyle = 'rgba(255, 100, 255, 0.4)';
                ctx.lineWidth = 1;
                ctx.shadowColor = '#ff64ff';
                ctx.shadowBlur = 6;
                for (let c = 0; c < activeCols.length; c++) {
                    const startJ = activeCols[c];
                    const endJ = activeCols[(c + 1) % activeCols.length];
                    ctx.beginPath();
                    ctx.moveTo((startJ + 0.5) * CELL_SIZE, y);
                    ctx.lineTo((endJ + 0.5) * CELL_SIZE, y);
                    ctx.stroke();
                }
            }
        }
    });

    // Col Interconnects
    interconnects.cols.forEach((isActive, index) => {
        if (isActive) {
            const j = INTERCONNECT_CHANNELS[index];
            const x = (j + 0.5) * CELL_SIZE;
            const activeRows = activeCells.filter(c => c.j === j).map(c => c.i).sort((a,b) => a-b);
            if (activeRows.length > 1) {
                ctx.strokeStyle = 'rgba(100, 255, 255, 0.4)';
                ctx.lineWidth = 1;
                ctx.shadowColor = '#64ffff';
                ctx.shadowBlur = 6;
                for (let r = 0; r < activeRows.length; r++) {
                    const startI = activeRows[r];
                    const endI = activeRows[(r + 1) % activeRows.length];
                    ctx.beginPath();
                    ctx.moveTo(x, (startI + 0.5) * CELL_SIZE);
                    ctx.lineTo(x, (endI + 0.5) * CELL_SIZE);
                    ctx.stroke();
                }
            }
        }
    });

    ctx.shadowBlur = 0; // Reset shadow for cell drawing

    // 5. Draw cells on top of links
    activeCells.forEach(cell => {
        const { i, j, activeLayers } = cell;
        const x = j * CELL_SIZE;
        const y = i * CELL_SIZE;
        
        let wasActive = false;
        for (let k = 0; k < DEPTH; k++) {
            if (prevLattice[i][j][k] === 1) {
                wasActive = true;
                break;
            }
        }
        const isNew = !wasActive;

        const baseColorRGB = [0, 170, 255];
        
        // Glow for newly active cells
        if (isNew) {
            const gradient = ctx.createRadialGradient(
                x + CELL_SIZE / 2, y + CELL_SIZE / 2, 0,
                x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * 0.6
            );
            gradient.addColorStop(0, `rgba(${baseColorRGB[0]}, ${baseColorRGB[1]}, ${baseColorRGB[2]}, 0.8)`);
            gradient.addColorStop(1, `rgba(${baseColorRGB[0]}, ${baseColorRGB[1]}, ${baseColorRGB[2]}, 0)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }

        // Cell core
        const coreSize = CELL_SIZE * 0.3 + (activeLayers / DEPTH) * (CELL_SIZE * 0.3);
        const offset = (CELL_SIZE - coreSize) / 2;
        ctx.fillStyle = `rgba(200, 255, 255, ${0.7 + (activeLayers/DEPTH)*0.3})`;
        ctx.fillRect(x + offset, y + offset, coreSize, coreSize);
    });

  }, [lattice, prevLattice, interconnects]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="max-w-full max-h-full"
            aria-label="Neural Link visualization showing signal propagation between cells."
        />
    </div>
  );
};