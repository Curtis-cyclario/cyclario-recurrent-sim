
import React, { useState, useRef, useLayoutEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // If close to top of viewport, flip to bottom
      if (rect.top < 50) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [isVisible]);

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && text && (
        <div 
          className={`absolute left-1/2 -translate-x-1/2 z-[100] px-3 py-1.5 w-max max-w-[200px] pointer-events-none
            ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
          `}
        >
          {/* Technical Border/Background */}
          <div className="bg-slate-950 border border-slate-600 text-slate-200 text-[10px] font-mono uppercase tracking-wide leading-tight shadow-xl rounded-sm">
            {/* Connector Line */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-px h-2 bg-slate-600 
              ${position === 'top' ? 'top-full' : 'bottom-full'}
            `}/>
            <div className="px-2 py-1">
              {text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
