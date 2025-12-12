import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`relative ${className || ''}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {text && (
        <div 
          className={`tooltip-container absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 w-max max-w-xs text-xs text-center text-cyan-200 component-panel rounded-md z-50 shadow-lg ${isVisible ? 'visible' : ''}`}
          style={{ animation: 'none' }} /* Disable old animation */
          role="tooltip"
        >
          {text}
        </div>
      )}
    </div>
  );
};