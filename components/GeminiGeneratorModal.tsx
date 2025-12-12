
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { GoogleGenAI, Type } from "@google/genai";

interface GeminiGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (config: { coreGrid?: number[][]; pattern?: number[][] }) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const SYSTEM_INSTRUCTION = `You are an expert in cellular automata and emergent systems, integrated into a simulation tool. Your task is to generate configurations for a 9x9x6 toroidal cellular automaton based on user descriptions. The automaton's logic is defined by a 3x3 "kernel" of gates.

You must respond ONLY with a valid JSON object matching the provided schema. Do not add any commentary, markdown, or any other text outside of the JSON structure.

The user can request two things:
1. A 3x3 'coreGrid' (kernel).
2. A 9x9 'pattern' (initial state).

Gate types for the kernel are:
- 3: XOR (active if neighbor sum is odd)
- 4: THRESHOLD (active if neighbor sum >= 2)
- 5: MEMORY (activates on sum 1, deactivates on sum > 1)
- 6: NOT (active if neighbor sum is 0)

Analyze the user's prompt to determine whether they want a new kernel ('coreGrid') or a new initial state ('pattern') and provide the corresponding JSON structure. Only provide one of the two keys, leaving the other out or null. For example, if the prompt is "design a kernel for chaotic behavior", you return a 'coreGrid'. If it's "create a pattern that looks like a spinning pinwheel", you return a 'pattern'.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    coreGrid: {
      type: Type.ARRAY,
      nullable: true,
      items: { type: Type.ARRAY, items: { type: Type.INTEGER } },
      description: 'A 3x3 grid of numbers representing the kernel. Use only if the user asks for a kernel, ruleset, or behavior.'
    },
    pattern: {
      type: Type.ARRAY,
      nullable: true,
      items: { type: Type.ARRAY, items: { type: Type.INTEGER } },
      description: 'A 9x9 grid of 0s and 1s representing the initial lattice state. Use only if the user asks for a starting pattern, shape, or form.'
    },
  },
};

const examplePrompts = [
    "A simple glider that moves diagonally",
    "A kernel that creates stable oscillators",
    "A pattern that expands like a crystal",
    "A kernel that leads to chaotic behavior",
    "A sparse, symmetric starting pattern",
];

const ModalContent: React.FC<GeminiGeneratorModalProps> = ({ isOpen, onClose, onApply }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        if (!input.trim() || isLoading) return;
        
        setIsLoading(true);
        setError(null);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: input,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseMimeType: 'application/json',
                    responseSchema: RESPONSE_SCHEMA,
                },
            });

            const jsonText = response.text.trim();
            const result = JSON.parse(jsonText);

            if (result.coreGrid && Array.isArray(result.coreGrid) && result.coreGrid.length === 3) {
                onApply({ coreGrid: result.coreGrid });
            } else if (result.pattern && Array.isArray(result.pattern) && result.pattern.length === 9) {
                onApply({ pattern: result.pattern });
            } else {
                throw new Error("Invalid format received from AI.");
            }
        } catch (err) {
            console.error("Gemini Generator error:", err);
            setError("Failed to generate a valid configuration. Please try a different prompt.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in-component" onClick={onClose}>
            <div className="component-panel rounded-lg max-w-lg w-full flex flex-col p-6 text-gray-300 relative" onClick={e => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-orbitron font-bold text-cyan-300 mb-2 tracking-wider">GENERATE WITH AI</h2>
                <p className="text-sm text-gray-400 mb-4">Describe a pattern or a behavior, and let AI create it for you.</p>

                <div className="flex flex-col gap-2">
                    <label htmlFor="generator-prompt" className="text-xs text-cyan-400/70 tracking-widest uppercase">Prompt</label>
                    <input
                        ref={inputRef}
                        id="generator-prompt"
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleGenerate()}
                        placeholder="e.g., A kernel for chaotic growth"
                        disabled={isLoading}
                        className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 transition-colors duration-200 disabled:opacity-50"
                    />
                </div>
                <div className="text-xs text-gray-500 mt-2 mb-4">
                    Examples: {examplePrompts.map((p, i) => (
                        <button key={i} onClick={() => setInput(p)} className="underline hover:text-gray-300 mr-2">{`"${p}"`}</button>
                    ))}
                </div>
                
                {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-500/50 p-3 rounded-md my-2">{error}</p>}
                
                <div className="mt-4 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 text-gray-300 bg-gray-800/50 border border-gray-600/50 hover:bg-gray-700/50">
                        CANCEL
                    </button>
                    <button onClick={handleGenerate} disabled={isLoading || !input.trim()} className="px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 text-cyan-300 bg-cyan-900/50 border border-cyan-500/50 hover:bg-cyan-800/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isLoading ? (
                           <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-300"></div> Generating...</>
                        ) : 'GENERATE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GeminiGeneratorModal: React.FC<GeminiGeneratorModalProps> = (props) => {
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
