import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface SavePatternModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
}

const ModalContent: React.FC<SavePatternModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
        }
    }, [isOpen]);
    
    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in-component" onClick={onClose}>
            <div className="component-panel rounded-lg max-w-sm w-full flex flex-col p-6 text-gray-300 relative" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-orbitron font-bold text-cyan-300 mb-4 tracking-wider">SAVE PATTERN</h2>
                <div className="flex flex-col gap-2">
                    <label htmlFor="pattern-name" className="text-xs text-cyan-400/70 tracking-widest uppercase">Pattern Name</label>
                    <input
                        id="pattern-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSave()}
                        placeholder="e.g., Stable Oscillator"
                        className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 transition-colors"
                        autoFocus
                    />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 text-gray-300 bg-gray-800/50 border border-gray-600/50 hover:bg-gray-700/50">
                        CANCEL
                    </button>
                    <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 text-cyan-300 bg-cyan-900/50 border border-cyan-500/50 hover:bg-cyan-800/50 disabled:opacity-50 disabled:cursor-not-allowed">
                        SAVE
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SavePatternModal: React.FC<SavePatternModalProps> = (props) => {
    const [isMounted, setIsMounted] = React.useState(false);
  
    useEffect(() => {
      setIsMounted(true);
      return () => setIsMounted(false);
    }, []);

    if (!isMounted) return null;
    
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(<ModalContent {...props} />, modalRoot);
};