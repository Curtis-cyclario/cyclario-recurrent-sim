
import React, { useRef, useEffect, useState } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, COLORS, INTERCONNECT_CHANNELS } from '../constants';

interface VolumetricLatticeProps {
  lattice: Lattice3D;
  kernelFace: number[][];
  glowIntensity: number;
  interconnects: { rows: boolean[]; cols: boolean[]; };
}

const CUBE_SIZE = 280;
const CELL_SPACING = CUBE_SIZE / (SIZE - 1);
const FOV = 400;

export const VolumetricLattice: React.FC<VolumetricLatticeProps> = ({ lattice, kernelFace, glowIntensity, interconnects }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: -0.5 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

  // Pre-calculate fixed geometry outside render loop
  const corners = [
    {x: -1, y: -1, z: -1}, {x: 1, y: -1, z: -1},
    {x: 1, y: 1, z: -1}, {x: -1, y: 1, z: -1},
    {x: -1, y: -1, z: 1}, {x: 1, y: -1, z: 1},
    {x: 1, y: 1, z: 1}, {x: -1, y: 1, z: 1}
  ].map(p => ({ x: p.x * CUBE_SIZE/2, y: p.y * CUBE_SIZE/2, z: p.z * CUBE_SIZE/2 }));

  const edges = [
    [0,1], [1,2], [2,3], [3,0], // Back face
    [4,5], [5,6], [6,7], [7,4], // Front face
    [0,4], [1,5], [2,6], [3,7]  // Connecting edges
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      // 1. Draw Wireframe Box
      ctx.strokeStyle = 'rgba(0, 170, 255, 0.15)';
      ctx.lineWidth = 1;
      
      // Project corners on the fly
      const projCorners = new Array(8);
      for(let i=0; i<8; i++) {
          const p = corners[i];
          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.x * sinY + p.z * cosY;
          const y2 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;
          const scale = FOV / (FOV + z2);
          projCorners[i] = { x: cx + x1 * scale, y: cy + y2 * scale };
      }

      ctx.beginPath();
      for(let i=0; i<12; i++) {
        const [s, e] = edges[i];
        ctx.moveTo(projCorners[s].x, projCorners[s].y);
        ctx.lineTo(projCorners[e].x, projCorners[e].y);
      }
      ctx.stroke();

      // 2. Collect Active Points
      // We use a simple array push here, optimized loops
      const points = [];
      const depth = lattice[0][0].length;
      const offset = (SIZE - 1) / 2;
      const depthOffset = (depth - 1) / 2;
      
      for (let i = 0; i < SIZE; i++) {
        // Pre-check row interconnect
        const rowIndex = INTERCONNECT_CHANNELS.indexOf(i);
        const rowActive = rowIndex !== -1 && interconnects.rows[rowIndex];
        const py = (i - offset) * CELL_SPACING;

        for (let j = 0; j < SIZE; j++) {
            const colIndex = INTERCONNECT_CHANNELS.indexOf(j);
            const isInterconnect = rowActive || (colIndex !== -1 && interconnects.cols[colIndex]);
            
            // Only process if there are active cells in this column
            const stack = lattice[i][j];
            let hasActive = false;
            for(let k=0; k<depth; k++) if(stack[k] === 1) { hasActive = true; break; }
            if(!hasActive) continue;

            const gate = kernelFace[i][j];
            const color = isInterconnect ? '#ffffff' : (COLORS[gate] || '#fff');
            const px = (j - offset) * CELL_SPACING;

            for (let k = 0; k < depth; k++) {
                if (stack[k] === 1) {
                    const pz = (k - depthOffset) * CELL_SPACING;

                    // Rotation
                    const x1 = px * cosY - pz * sinY;
                    const z1 = px * sinY + pz * cosY;
                    const y2 = py * cosX - z1 * sinX;
                    const z2 = py * sinX + z1 * cosX;

                    const scale = FOV / (FOV + z2);
                    
                    points.push({
                        x: cx + x1 * scale,
                        y: cy + y2 * scale,
                        z: z2,
                        color: color,
                        scale: scale,
                        isInterconnect: isInterconnect
                    });
                }
            }
        }
      }

      // Sort by Z (painters algorithm)
      points.sort((a, b) => b.z - a.z);

      // Batch Draw
      for(let i=0; i<points.length; i++) {
          const p = points[i];
          const alpha = p.isInterconnect ? 1 : Math.min(1, 0.6 + glowIntensity * 0.2);
          const size = (p.isInterconnect ? 5 : 3) * p.scale;
          
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, 6.28); // 2*PI approx
          ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      if (!isDragging.current) {
          setRotation(prev => ({ ...prev, y: prev.y + 0.002 }));
      }
      
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    render();
    return () => { if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [lattice, kernelFace, glowIntensity, interconnects, rotation]); 

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotation(prev => ({ x: prev.x + dy * 0.005, y: prev.y + dx * 0.005 }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div className="w-full h-full flex items-center justify-center cursor-move">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="max-w-full max-h-full"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        aria-label="Volumetric Lattice 3D View"
      />
    </div>
  );
};
