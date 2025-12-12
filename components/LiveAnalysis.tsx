import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { MetricsData, PhysicsModel } from '../types';

interface LiveAnalysisProps {
  metricsHistory: MetricsData[];
  isRunning: boolean;
  coreGrid: number[][];
  physicsModel: PhysicsModel;
}

const SYSTEM_INSTRUCTION = `You are a senior simulation analyst for the "Recurrent Automaton" project. You will receive a data packet containing the current simulation parameters (kernel, physics model) and a statistical summary of the recent run.

Your task is to provide a detailed, insightful analysis in two parts, formatted as a JSON object with two keys: "phase" and "briefing".

1.  **phase**: A short, descriptive title for the system's current behavior (e.g., "Stable Oscillation", "Chaotic Expansion", "Seeking Equilibrium", "Rapid State Decay"). Capitalize the first letter of each word.
2.  **briefing**: A concise paragraph (2-4 sentences) explaining your reasoning. Connect the observed metrics (energy, thermal load, protection delta) to the provided kernel and physics model to explain WHY the system is behaving this way. Be technical and specific.

Do not include any text, markdown, or commentary outside the JSON object.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    phase: { type: Type.STRING },
    briefing: { type: Type.STRING },
  },
  required: ['phase', 'briefing'],
}

const ANALYSIS_WINDOW = 200; // Analyze up to the last 200 steps

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const GeminiIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
        <path d="M9.5 14.5C11.9853 14.5 14 12.4853 14 10C14 7.51472 11.9853 5.5 9.5 5.5C7.01472 5.5 5 7.51472 5 10C5 12.4853 7.01472 14.5 9.5 14.5Z" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 4.5L19 8.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 10H19.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 10H-0.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 15.5L19 11.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a,b) => a+b, 0) / arr.length : 0;
const stdDev = (arr: number[]) => {
    if (arr.length < 2) return 0;
    const n = arr.length;
    const mean = avg(arr);
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

export const LiveAnalysis: React.FC<LiveAnalysisProps> = ({ metricsHistory, isRunning, coreGrid, physicsModel }) => {
  const [analysis, setAnalysis] = useState({phase: "Analyst Standby", briefing: "Run simulation then pause to generate analysis."});
  const [isLoading, setIsLoading] = useState(false);
  
  // Track previous running state to detect pause
  const prevIsRunning = useRef(isRunning);
  // Keep a ref to metricsHistory to access it inside useEffect without dependency issues
  const historyRef = useRef(metricsHistory);

  useEffect(() => {
    historyRef.current = metricsHistory;
  }, [metricsHistory]);

  useEffect(() => {
    // Detect Falling Edge (Running -> Paused)
    if (prevIsRunning.current && !isRunning) {
        generateAnalysis();
    } 
    // Detect Rising Edge (Paused -> Running)
    else if (!prevIsRunning.current && isRunning) {
         setAnalysis({phase: "Acquiring Telemetry...", briefing: "Monitoring system dynamics. Analysis will start automatically when you pause."});
    }

    prevIsRunning.current = isRunning;
  }, [isRunning]);

  const generateAnalysis = async () => {
    const history = historyRef.current;
    
    if (history.length < 10) {
        setAnalysis({phase: "Insufficient Data", briefing: "Run the simulation longer to generate a meaningful analysis."});
        return;
    }

    setIsLoading(true);

    const recentHistory = history.slice(-ANALYSIS_WINDOW);
    
    const summary = recentHistory.reduce((acc, curr) => {
        acc.delta_swastika.push(curr.delta_swastika);
        acc.energy.push(curr.energy);
        acc.thermalLoad.push(curr.thermalLoad);
        return acc;
    }, { delta_swastika: [] as number[], energy: [] as number[], thermalLoad: [] as number[] });
    
    const prompt = `
    // DATA PACKET //
    // CONFIGURATION //
    Physics Model: ${physicsModel}
    Kernel: ${JSON.stringify(coreGrid)}

    // METRICS SUMMARY (last ${recentHistory.length} steps) //
    Protection (Δs): avg=${avg(summary.delta_swastika).toFixed(2)}, stdDev=${stdDev(summary.delta_swastika).toFixed(2)}
    Energy: avg=${avg(summary.energy).toFixed(2)}, stdDev=${stdDev(summary.energy).toFixed(2)}
    Thermal Load: avg=${avg(summary.thermalLoad).toFixed(2)}, trend=${(recentHistory[recentHistory.length - 1].thermalLoad - recentHistory[0].thermalLoad).toFixed(3)}
    
    Provide your analysis in the specified JSON format.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
        }
      });
      const result = JSON.parse(response.text.trim());
      setAnalysis(result);
    } catch (err) {
      console.error("Live Analysis error:", err);
      setAnalysis({phase: "Analysis Error", briefing: "Could not retrieve analysis from model."});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="component-panel p-4 rounded-lg w-full">
      <h3 className="text-lg font-orbitron font-bold text-cyan-300 mb-3 text-center tracking-wider">
        OPERATIONAL ANALYSIS
      </h3>
      <div className="bg-slate-900/40 p-3 rounded-md min-h-[100px] flex items-start gap-3">
        <GeminiIcon />
        <div className="flex-1">
            {isLoading ? (
                <div className="flex flex-col gap-2">
                    <span className="font-orbitron text-cyan-400 text-glow animate-pulse">Analyzing Telemetry...</span>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 animate-progress origin-left"></div>
                    </div>
                </div>
            ) : (
                <>
                    <h4 className="font-orbitron text-cyan-400 text-glow">{analysis.phase}</h4>
                    <p className="text-sm text-gray-300 leading-relaxed mt-1">{analysis.briefing}</p>
                </>
            )}
        </div>
      </div>
      <style>{`
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
        .animate-progress {
            animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};