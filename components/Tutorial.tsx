
import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  targetSelector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: TutorialStep[] = [
  {
    targetSelector: '',
    position: 'center',
    title: 'Welcome to the Simulator!',
    content: "This is a brief tour of the Recurrent Automaton's interface. Use the buttons below to navigate.",
  },
  {
    targetSelector: '.interface-selector-container',
    position: 'bottom',
    title: 'Visualization Modes',
    content: 'Switch between different views of the simulation here. Each mode offers a unique perspective on the automaton\'s state, from the core logic to a 3D volumetric display.',
  },
  {
    targetSelector: '.lattice-container',
    position: 'bottom',
    title: 'The Lattice',
    content: 'This is the main simulation grid. You can click on any cell to activate or deactivate it when the simulation is stopped, creating your own custom patterns.',
  },
  {
    targetSelector: '.controls-container',
    position: 'top',
    title: 'Main Controls',
    content: 'Use these controls to start, stop, and step through the simulation. You can also reset the grid, load preset patterns, and adjust the simulation speed.',
  },
  {
    targetSelector: '.kernel-editor-container',
    position: 'right',
    title: 'Kernel Editor',
    content: 'This 3x3 grid is the "brain" of the automaton. The rules you set here are mirrored across the entire lattice to determine how cells behave. Experiment with different configurations!',
  },
  {
    targetSelector: '#investor-qa-button',
    position: 'top',
    title: 'Investor Q&A',
    content: 'Click here to chat with an AI assistant powered by Gemini. It can answer your questions about the project\'s technology and investment opportunities.',
  },
  {
    targetSelector: '',
    position: 'center',
    title: "You're Ready!",
    content: 'You now know the basics. Feel free to explore and discover the emergent behaviors of the Cohesive Toroidal Engine. You can restart this tutorial anytime from the help button.',
  },
];

const TutorialContent: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const currentStep = steps[currentStepIndex];

  const calculatePositions = useCallback(() => {
    if (!currentStep) return;

    if (currentStep.position === 'center' || !currentStep.targetSelector) {
      setHighlightRect(null);
      setPopoverPos({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);

      const popoverWidth = 320;
      const popoverHeight = 200; // Estimated height
      const gap = 15;

      let top = 0, left = 0;

      switch (currentStep.position) {
        case 'top':
          top = rect.top - popoverHeight - gap;
          left = rect.left + rect.width / 2 - popoverWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - popoverWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - popoverHeight / 2;
          left = rect.left - popoverWidth - gap;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - popoverHeight / 2;
          left = rect.right + gap;
          break;
      }
      
      // Basic bounds checking
      if (left < 10) left = 10;
      if (left + popoverWidth > window.innerWidth - 10) left = window.innerWidth - popoverWidth - 10;
      if (top < 10) top = 10;
      if (top + popoverHeight > window.innerHeight - 10) top = window.innerHeight - popoverHeight - 10;

      setPopoverPos({ top, left });
    }
  }, [currentStep]);

  useLayoutEffect(() => {
    if (isOpen) {
      calculatePositions();
      window.addEventListener('resize', calculatePositions);
    } else {
      setTimeout(() => setCurrentStepIndex(0), 400); // Reset on close
    }
    return () => window.removeEventListener('resize', calculatePositions);
  }, [isOpen, calculatePositions]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!isOpen) return null;

  const isCentered = currentStep.position === 'center';
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="tutorial-overlay" aria-live="polite">
      <div className="tutorial-backdrop" onClick={onClose} />
      {highlightRect && (
        <div
          className="tutorial-highlight"
          style={{
            top: `${highlightRect.top - 5}px`,
            left: `${highlightRect.left - 5}px`,
            width: `${highlightRect.width + 10}px`,
            height: `${highlightRect.height + 10}px`,
          }}
        />
      )}
      <div
        className="tutorial-popover"
        style={{
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          transform: isCentered ? 'translate(-50%, -50%)' : 'none',
        }}
        role="dialog"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-content"
      >
        <div className="component-panel rounded-lg p-4 bg-slate-800 border border-slate-600 relative">
          {!isCentered && currentStep.position && <div className={`tutorial-popover-arrow ${currentStep.position}`} />}
          <h3 id="tutorial-title" className="text-xl font-orbitron font-bold text-cyan-300 mb-3 tracking-wider">{currentStep.title}</h3>
          <p id="tutorial-content" className="text-sm text-gray-300 mb-4">{currentStep.content}</p>
          <div className="flex justify-between items-center">
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-white transition-colors">Skip</button>
            <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <button onClick={handlePrev} className="px-3 py-1.5 text-sm font-bold rounded-md transition-all duration-200 text-gray-300 bg-gray-800/50 border border-gray-600/50 hover:bg-gray-700/50">
                  Previous
                </button>
              )}
              <button onClick={handleNext} className="px-3 py-1.5 text-sm font-bold rounded-md transition-all duration-200 text-cyan-300 bg-cyan-900/50 border border-cyan-500/50 hover:bg-cyan-800/50">
                {isLastStep ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Tutorial: React.FC<TutorialProps> = (props) => {
    const [isMounted, setIsMounted] = useState(false);
  
    // FIX: useEffect was not imported, which caused a 'Cannot find name' error.
    useEffect(() => {
      setIsMounted(true);
      return () => setIsMounted(false);
    }, []);

    if (!isMounted) return null;
    
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(<TutorialContent {...props} />, modalRoot);
};