
import React, { useRef, useEffect, useState } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, COLORS } from '../constants';

interface QubeItLatticeProps {
  lattice: Lattice3D;
  kernelFace: number[][];
  glowIntensity: number;
}

interface Point3D { x: number; y: number; z: number; }
interface Point2D { x: number; y: number; }
interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
  val: number;
  gate: number;
}

const CUBE_SIZE = 250;
const CELL_SPACING = CUBE_SIZE / (SIZE - 1);

const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

export const QubeItLattice: React.FC<QubeItLatticeProps> = ({ lattice, kernelFace, glowIntensity }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: Math.PI / 6, y: -Math.PI / 6 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const depth = lattice[0][0].length;

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    setRotation(prev => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01,
    }));
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const points3D: ProjectedPoint[] = [];
    const fov = 350;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      const rotX = rotation.x;
      const rotY = rotation.y;
      const sinX = Math.sin(rotX);
      const cosX = Math.cos(rotX);
      const sinY = Math.sin(rotY);
      const cosY = Math.cos(rotY);
      
      points3D.length = 0;

      for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
          for (let k = 0; k < depth; k++) {
              if(lattice[i][j][k] === 1) {
                let p: Point3D = {
                  x: (j - (SIZE-1)/2) * CELL_SPACING,
                  y: (i - (SIZE-1)/2) * CELL_SPACING,
                  z: (k - (depth-1)/2) * CELL_SPACING,
                };

                // Rotate Y
                let p_rot = { x: p.x * cosY - p.z * sinY, y: p.y, z: p.x * sinY + p.z * cosY };
                // Rotate X
                p = { x: p_rot.x, y: p_rot.y * cosX - p_rot.z * sinX, z: p_rot.y * sinX + p_rot.z * cosX };

                const scale = fov / (fov + p.z);
                points3D.push({ 
                    x: p.x * scale,
                    y: p.y * scale,
                    z: p.z,
                    val: lattice[i][j][k],
                    gate: kernelFace[i][j]
                });
              }
          }
        }
      }
      
      points3D.sort((a, b) => a.z - b.z);

      // Draw cube wireframe
      const corners: Point3D[] = [];
      const half = CUBE_SIZE / 2;
      for (let i = 0; i < 8; i++) {
        corners.push({
          x: (i & 1 ? half : -half),
          y: (i & 2 ? half : -half),
          z: (i & 4 ? half : -half),
        });
      }

      const projectedCorners = corners.map(p => {
        let p_rot = { x: p.x * cosY - p.z * sinY, y: p.y, z: p.x * sinY + p.z * cosY };
        p = { x: p_rot.x, y: p_rot.y * cosX - p_rot.z * sinX, z: p_rot.y * sinX + p_rot.z * cosX };
        const scale = fov / (fov + p.z);
        return { x: p.x * scale, y: p.y * scale };
      });
      
      ctx.strokeStyle = 'rgba(0, 170, 255, 0.2)';
      ctx.lineWidth = 1;
      const edges = [[0,1], [1,3], [3,2], [2,0], [4,5], [5,7], [7,6], [6,4], [0,4], [1,5], [2,6], [3,7]];
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projectedCorners[i].x, projectedCorners[i].y);
        ctx.lineTo(projectedCorners[j].x, projectedCorners[j].y);
        ctx.stroke();
      });


      // Draw points
      for (const p of points3D) {
          const color = COLORS[p.gate];
          const rgb = hexToRgb(color);
          if(!rgb) continue;

          const depthFactor = (p.z + CUBE_SIZE/2) / CUBE_SIZE;
          const opacity = 0.5 + (1 - depthFactor) * 0.5;
          const size = 1 + (1 - depthFactor) * 2.5;

          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
      }

      ctx.restore();
    };

    render();
    
  }, [lattice, kernelFace, rotation, glowIntensity, depth]);

  return (
    <div className="w-full h-full flex items-center justify-center cursor-move">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full max-h-full"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label="Interactive 3D visualization of the 9x9x9 QubeIt lattice. Click and drag to rotate."
      />
    </div>
  );
};
