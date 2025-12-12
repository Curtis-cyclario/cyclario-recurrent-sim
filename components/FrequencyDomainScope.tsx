
import React, { useRef, useEffect } from 'react';
import { calculateFFT, padSignal } from '../utils/fft';

interface FrequencyDomainScopeProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

export const FrequencyDomainScope: React.FC<FrequencyDomainScopeProps> = ({
  data,
  width = 120,
  height = 40,
  color = '#00aaff',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!data || data.length < 2) return;

    // 1. Pad and process data
    const paddedData = padSignal(data);
    const fftMagnitudes = calculateFFT(paddedData);

    if (fftMagnitudes.length === 0) return;

    // 2. Normalize magnitudes (log scale for better visualization)
    const logMagnitudes = fftMagnitudes.map(m => Math.log1p(m));
    const maxMagnitude = Math.max(...logMagnitudes, 1); // Avoid division by zero
    const normalized = logMagnitudes.map(m => m / maxMagnitude);

    // 3. Render
    const barCount = normalized.length;
    const barWidth = width / barCount;
    const rgbColor = hexToRgb(color);

    for (let i = 0; i < barCount; i++) {
      const barHeight = normalized[i] * height;
      const x = i * barWidth;
      const y = height - barHeight;
      
      if (rgbColor) {
        // Create a gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0.9)`);
        gradient.addColorStop(1, `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0.2)`);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = color;
      }

      ctx.fillRect(x, y, barWidth, barHeight);
    }
    
    // Add a subtle glow effect to the whole canvas
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(canvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;


  }, [data, width, height, color]);

  return (
    <div className="relative">
        <canvas ref={canvasRef} width={width} height={height} />
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-1 -mb-1">
            <span>LF</span>
            <span>HF</span>
        </div>
    </div>
  );
};
