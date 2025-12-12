import React from 'react';
import { Tooltip } from './Tooltip';

interface FooterProps {
    onMenuClick: () => void;
    onHelpClick: () => void;
}

const GeminiIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 14.5C11.9853 14.5 14 12.4853 14 10C14 7.51472 11.9853 5.5 9.5 5.5C7.01472 5.5 5 7.51472 5 10C5 12.4853 7.01472 14.5 9.5 14.5Z" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 4.5L19 8.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 10H19.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 10H-0.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 15.5L19 11.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const HamburgerIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const HelpIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.09 9.00002C9.3251 8.33168 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52153 14.2151 8.06354C14.6714 8.60555 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const Footer: React.FC<FooterProps> = ({ onMenuClick, onHelpClick }) => {
    return (
        <footer className="fixed bottom-4 right-4 flex items-center gap-3 z-50">
            <Tooltip text="Powered by the Google Gemini API">
                 <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" aria-label="About Gemini API">
                    <GeminiIcon />
                </a>
            </Tooltip>
            <Tooltip text="Application Tutorial">
                <button
                    onClick={onHelpClick}
                    className="component-panel p-2 rounded-full text-cyan-300 hover:text-white hover:bg-slate-700/70 transition-colors"
                    aria-label="Open application tutorial"
                >
                    <HelpIcon />
                </button>
            </Tooltip>
            <Tooltip text="Information for Investors (Q&A)">
                 <button 
                    id="investor-qa-button"
                    onClick={onMenuClick} 
                    className="component-panel p-2 rounded-full text-cyan-300 hover:text-white hover:bg-slate-700/70 transition-colors"
                    aria-label="Open information menu"
                >
                    <HamburgerIcon />
                </button>
            </Tooltip>
        </footer>
    );
};