
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
const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction: SYSTEM_INSTRUCTION },
});

const ModalContent: React.FC<GeminiChatModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus input when modal opens or when loading is finished
        if (isOpen && !isLoading) {
            inputRef.current?.focus();
        }
    }, [isOpen, isLoading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setIsLoading(true);
            // Start the conversation with a greeting from the model
            chat.sendMessage({ message: "Hello, introduce yourself and ask me a question about the project." })
                .then(response => {
                    setMessages([{ role: 'model', text: response.text }]);
                })
                .catch(err => {
                    console.error("Gemini API error:", err);
                    setMessages([{ role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
                })
                .finally(() => setIsLoading(false));
        } else if (!isOpen) {
            // Reset chat on close
            setMessages([]);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: input });
            
            let currentModelMessage = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            for await (const chunk of stream) {
                currentModelMessage += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: currentModelMessage };
                    return newMessages;
                });
            }
        } catch (err) {
            console.error("Gemini API stream error:", err);
            setMessages(prev => [...prev, { role: 'model', text: "An error occurred. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in-component" onClick={onClose}>
            <div className="component-panel rounded-lg max-w-2xl w-full h-[80vh] flex flex-col p-6 text-gray-300 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-orbitron font-bold text-cyan-300 mb-4 tracking-wider">INVESTOR Q&A</h2>
                <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex-shrink-0"></div>}
                            <div className={`max-w-md p-3 rounded-lg text-sm ${msg.role === 'model' ? 'bg-slate-800/70' : 'bg-indigo-800/80'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length-1]?.role === 'user' && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex-shrink-0"></div>
                            <div className="max-w-md p-3 rounded-lg bg-slate-800/70 text-sm">
                                <div className="animate-pulse flex space-x-2">
                                    <div className="rounded-full bg-slate-600 h-2 w-2"></div>
                                    <div className="rounded-full bg-slate-600 h-2 w-2"></div>
                                    <div className="rounded-full bg-slate-600 h-2 w-2"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-4 flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-grow bg-slate-800 border border-slate-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 transition-colors duration-200 disabled:opacity-50"
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 text-cyan-300 bg-cyan-900/50 border border-cyan-500/50 hover:bg-cyan-800/50 disabled:opacity-50 disabled:cursor-not-allowed">
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GeminiChatModal: React.FC<GeminiChatModalProps> = (props) => {
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
