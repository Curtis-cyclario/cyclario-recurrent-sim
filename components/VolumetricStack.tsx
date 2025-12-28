
import React, { useRef, useEffect, useState } from 'react';
import type { Lattice3D } from '../types';
import { SIZE, COLORS, INTERCONNECT_CHANNELS, DEPTH } from '../constants';

interface VolumetricStackProps {
  lattice: Lattice3D;
  kernelFace: number[][];
  glowIntensity: number;
  interconnects: { rows: boolean[]; cols: boolean[]; };
}

const CUBE_SIZE = 280;
const CELL_SPACING = CUBE_SIZE / (SIZE - 1);
const FOV = 600;

export const VolumetricStack: React.FC<VolumetricStackProps> = ({ lattice, kernelFace, glowIntensity, interconnects }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: -0.5 });
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef<'rotate' | 'pan' | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | undefined>(undefined);

  const corners = [
    {x: -1, y: -1, z: -1}, {x: 1, y: -1, z: -1},
    {x: 1, y: 1, z: -1}, {x: -1, y: 1, z: -1},
    {x: -1, y: -1, z: 1}, {x: 1, y: -1, z: 1},
    {x: 1, y: 1, z: 1}, {x: -1, y: 1, z: 1}
  ].map(p => ({ x: p.x * CUBE_SIZE/2, y: p.y * CUBE_SIZE/2, z: p.z * CUBE_SIZE/2 }));

  const edges = [
    [0,1], [1,2], [2,3], [3,0],
    [4,5], [5,6], [6,7], [7,4],
    [0,4], [1,5], [2,6], [3,7]
  ];

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      tick += 0.03;
      const pulse = (Math.sin(tick) + 1) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2 + pan.x;
      const cy = canvas.height / 2 + pan.y;
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      // Wireframe Projection
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      const projCorners = new Array(8);
      for(let i=0; i<8; i++) {
          const p = corners[i];
          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.x * sinY + p.z * cosY;
          const y2 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;
          const scale = (FOV * zoom) / (FOV + z2);
          projCorners[i] = { x: cx + x1 * scale, y: cy + y2 * scale };
      }

      ctx.beginPath();
      for(let i=0; i<12; i++) {
        const [s, e] = edges[i];
        ctx.moveTo(projCorners[s].x, projCorners[s].y);
        ctx.lineTo(projCorners[e].x, projCorners[e].y);
      }
      ctx.stroke();

      // Point Projection
      const points = [];
      const offset = (SIZE - 1) / 2;
      const depthOffset = (DEPTH - 1) / 2;
      
      for (let i = 0; i < SIZE; i++) {
        const py = (i - offset) * CELL_SPACING;
        const rowIndex = INTERCONNECT_CHANNELS.indexOf(i);
        const rowActive = rowIndex !== -1 && interconnects.rows[rowIndex];

        for (let j = 0; j < SIZE; j++) {
            const px = (j - offset) * CELL_SPACING;
            const colIndex = INTERCONNECT_CHANNELS.indexOf(j);
            const isInterconnect = rowActive || (colIndex !== -1 && interconnects.cols[colIndex]);
            
            const gate = kernelFace[i][j];
            const baseColorHex = isInterconnect ? '#eab308' : (COLORS[gate] || '#38bdf8');
            const rgb = hexToRgb(baseColorHex);

            for (let k = 0; k < DEPTH; k++) {
                const idx = (i * SIZE * DEPTH) + (j * DEPTH) + k;
                if (lattice[idx] === 1) {
                    const pz = (k - depthOffset) * CELL_SPACING;
                    const x1 = px * cosY - pz * sinY;
                    const z1 = px * sinY + pz * cosY;
                    const y2 = py * cosX - z1 * sinX;
                    const z2 = py * sinX + z1 * cosX;
                    const scale = (FOV * zoom) / (FOV + z2);
                    
                    points.push({
                        x: cx + x1 * scale,
                        y: cy + y2 * scale,
                        z: z2,
                        rgb: rgb,
                        scale: scale,
                        isInterconnect: isInterconnect
                    });
                }
            }
        }
      }

      points.sort((a, b) => b.z - a.z);

      ctx.globalCompositeOperation = 'lighter';
      for(let i=0; i<points.length; i++) {
          const p = points[i];
          const depthFactor = (p.z + CUBE_SIZE) / (CUBE_SIZE * 2);
          const baseRadius = (p.isInterconnect ? 5 : 3.5) * p.scale;
          const radius = baseRadius * (0.85 + pulse * 0.15) * glowIntensity;
          const alpha = (0.3 + depthFactor * 0.7) * (p.isInterconnect ? 1.0 : 0.85);
          
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.5);
          const colorStr = `rgba(${p.rgb.r}, ${p.rgb.g}, ${p.rgb.b}, ${alpha})`;
          const fadeStr = `rgba(${p.rgb.r}, ${p.rgb.g}, ${p.rgb.b}, 0)`;
          
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.15, colorStr);
          grad.addColorStop(1, fadeStr);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2.5, 0, 6.28);
          ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      if (!isDragging.current) {
          setRotation(prev => ({ 
            ...prev, 
            y: prev.y + 0.002, 
            x: prev.x + Math.sin(tick * 0.1) * 0.0003 
          }));
      }
      
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    render();
    return () => { if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [lattice, kernelFace, glowIntensity, interconnects, rotation, zoom, pan]); 

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = (e.button === 0) ? 'rotate' : 'pan';
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (e.button !== 0) e.preventDefault();
  };

  const handleMouseUp = () => { isDragging.current = null; };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    
    if (isDragging.current === 'rotate') {
        setRotation(prev => ({ x: prev.x + dy * 0.005, y: prev.y + dx * 0.005 }));
    } else {
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    }
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.2, Math.min(5, prev * delta)));
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      <div className="absolute top-4 right-4 flex flex-col gap-1 items-end pointer-events-none opacity-40">
          <span className="hud-label text-[7px]">Left_Drag: Rotate</span>
          <span className="hud-label text-[7px]">Right_Drag: Pan</span>
          <span className="hud-label text-[7px]">Wheel: Zoom</span>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={700}
        className="max-w-full max-h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
};
