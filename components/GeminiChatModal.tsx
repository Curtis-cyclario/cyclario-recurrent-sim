
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { ChatMessage } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

interface GeminiChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Maintain chat instance outside component to persist context across opens/closes if desired,
// or recreate inside if we want fresh sessions. Keeping outside for now but resetting on open.
let chatSession: Chat | null = null;

const ModalContent: React.FC<GeminiChatModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize/Reset Chat
    useEffect(() => {
        if (isOpen) {
            chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: SYSTEM_INSTRUCTION },
            });
            setMessages([]); // Clear visual history
            setIsLoading(true);
            
            // Initial greeting
            chatSession.sendMessage({ message: "Hello. Initiate introduction protocol." })
                .then(response => {
                    setMessages([{ role: 'model', text: response.text || "System Online." }]);
                })
                .catch(err => {
                    console.error("Gemini Handshake Error:", err);
                    setMessages([{ role: 'model', text: "Connection destabilized." }]);
                })
                .finally(() => {
                    setIsLoading(false);
                    inputRef.current?.focus();
                });
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !chatSession) return;
        
        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            const result = await chatSession.sendMessageStream({ message: userText });
            
            // Create placeholder for model response
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            let fullText = '';
            for await (const chunk of result) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullText += chunkText;
                    // Functional update to append text to the last message
                    setMessages(prev => {
                        const newArr = [...prev];
                        const lastIndex = newArr.length - 1;
                        newArr[lastIndex] = { ...newArr[lastIndex], text: fullText };
                        return newArr;
                    });
                }
            }
        } catch (err) {
            console.error("Gemini Stream Error:", err);
            setMessages(prev => [...prev, { role: 'model', text: "Packet Loss Detected. Retrying recommended." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 fade-in-component" onClick={onClose}>
            <div className="component-panel rounded-lg max-w-2xl w-full h-[80vh] flex flex-col p-6 text-gray-300 relative border-cyan-900/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                    <div>
                        <h2 className="text-xl font-orbitron font-bold text-cyan-300 tracking-wider">INVESTOR UPLINK</h2>
                        <div className="text-[10px] font-mono text-emerald-500 uppercase">Secure Channel // Gemini-2.5-Flash</div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-grow overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-sm bg-cyan-900/30 border border-cyan-700 flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold font-mono text-xs">AI</div>
                            )}
                            <div className={`max-w-[80%] p-3 rounded-sm text-sm border ${msg.role === 'model' ? 'bg-slate-900/50 border-slate-700 text-slate-300' : 'bg-cyan-950/30 border-cyan-800 text-cyan-100'}`}>
                                <p className="leading-relaxed whitespace-pre-wrap font-mono">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length-1]?.role === 'user' && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-sm bg-cyan-900/30 border border-cyan-700 flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold font-mono text-xs">...</div>
                            <div className="p-3">
                                <span className="font-mono text-xs text-cyan-500 animate-pulse">Computing Response...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="mt-6 flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Query the system architecture..."
                        disabled={isLoading}
                        className="flex-grow bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3 font-mono transition-colors disabled:opacity-50"
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isLoading || !input.trim()} 
                        className="px-6 py-2 text-sm font-bold font-orbitron rounded-sm transition-all duration-200 text-slate-900 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
                    >
                        TX
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GeminiChatModal: React.FC<GeminiChatModalProps> = (props) => {
    const [isMounted, setIsMounted] = React.useState(false);
    useEffect(() => { setIsMounted(true); return () => setIsMounted(false); }, []);
    if (!isMounted) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;
    return ReactDOM.createPortal(<ModalContent {...props} />, modalRoot);
};
