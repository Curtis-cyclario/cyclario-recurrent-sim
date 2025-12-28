
import React, { useEffect, useRef } from 'react';
import { useLiveSession } from '../hooks/useLiveSession';

export const VoiceHUD: React.FC = () => {
  const { isConnected, isSpeaking, volume, connect, disconnect } = useLiveSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Initializing with undefined to satisfy strict "useRef" argument requirements
  const animationRef = useRef<number | undefined>(undefined);

  // Visualization Loop
  useEffect(() => {
    if (!isConnected) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;
      
      ctx.clearRect(0, 0, w, h);
      
      // Background Grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.stroke();

      // Waveform
      ctx.beginPath();
      const amplitude = isSpeaking ? 0.8 : (volume * 2.0); // Visualize output or input
      const color = isSpeaking ? '#38bdf8' : '#34d399'; // Blue for AI, Green for User
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      for(let x = 0; x < w; x++) {
        const y = cy + Math.sin(x * 0.1 + tick) * (amplitude * 20) * Math.sin(x * 0.05);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      tick += 0.2;
      animationRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
        if(animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [isConnected, isSpeaking, volume]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      {!isConnected ? (
         <button 
            onClick={connect}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 border border-cyan-500/50 rounded-full text-cyan-400 font-orbitron text-sm hover:bg-cyan-900/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,211,238,0.2)]"
         >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            INITIALIZE VOICE LINK
         </button>
      ) : (
        <div className="flex flex-col items-center">
             <div className="relative bg-slate-950 border border-slate-700 rounded-sm p-1 shadow-2xl">
                 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>
                 <canvas ref={canvasRef} width={240} height={60} className="block" />
             </div>
             <button 
                onClick={disconnect}
                className="mt-2 text-[10px] text-red-400 font-mono uppercase hover:text-red-300 tracking-widest"
             >
                TERMINATE UPLINK
             </button>
        </div>
      )}
    </div>
  );
};
