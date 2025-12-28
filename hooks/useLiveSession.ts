
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';
const API_KEY = process.env.API_KEY || '';

interface LiveSessionState {
  isConnected: boolean;
  isSpeaking: boolean;
  volume: number; // For visualization
}

export const useLiveSession = () => {
  const [state, setState] = useState<LiveSessionState>({
    isConnected: false,
    isSpeaking: false,
    volume: 0,
  });

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper: Base64 to Float32
  const decodeAudioData = async (
    base64String: string, 
    ctx: AudioContext
  ): Promise<AudioBuffer> => {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert 16-bit PCM to Float32
    const dataInt16 = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) {
      float32Data[i] = dataInt16[i] / 32768.0;
    }

    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.copyToChannel(float32Data, 0);
    return buffer;
  };

  // Helper: Float32 to Base64 (PCM 16-bit)
  const floatTo16BitPCM = (input: Float32Array) => {
     const output = new Int16Array(input.length);
     for (let i = 0; i < input.length; i++) {
         const s = Math.max(-1, Math.min(1, input[i]));
         output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
     }
     const bytes = new Uint8Array(output.buffer);
     let binary = '';
     for (let i = 0; i < bytes.byteLength; i++) {
         binary += String.fromCharCode(bytes[i]);
     }
     return btoa(binary);
  };

  const connect = useCallback(async () => {
    if (state.isConnected) return;

    try {
      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

      if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();

      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      // 2. Start Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 3. Connect to Gemini Live
      sessionPromiseRef.current = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Deep, technical voice
          },
          systemInstruction: "You are the operating system of the Cyclario Cohesive Toroidal Engine. You are terse, technical, and slightly enigmatic. You assist the engineer in analyzing the lattice. Keep responses short and spoken.",
        },
        callbacks: {
          onopen: () => {
            console.log("Cyclario Voice Link Established");
            setState(prev => ({ ...prev, isConnected: true }));

            // Setup Input Processing
            if (!inputAudioContextRef.current) return;
            const ctx = inputAudioContextRef.current;
            inputSourceRef.current = ctx.createMediaStreamSource(stream);
            processorRef.current = ctx.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Visualization Vol
                let sum = 0;
                for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                const rms = Math.sqrt(sum / inputData.length);
                setState(prev => ({ ...prev, volume: rms }));

                // Send to API
                const base64Data = floatTo16BitPCM(inputData);
                sessionPromiseRef.current?.then(session => {
                    session.sendRealtimeInput({
                        media: {
                            mimeType: 'audio/pcm;rate=16000',
                            data: base64Data
                        }
                    });
                });
            };

            inputSourceRef.current.connect(processorRef.current);
            processorRef.current.connect(ctx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const outputCtx = outputAudioContextRef.current;
            if (!outputCtx || !outputNodeRef.current) return;

            // Handle Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const buffer = await decodeAudioData(base64Audio, outputCtx);
                const source = outputCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputNodeRef.current);
                
                // Simple scheduling
                const now = outputCtx.currentTime;
                const start = Math.max(now, nextStartTimeRef.current);
                source.start(start);
                nextStartTimeRef.current = start + buffer.duration;
                
                source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                    setState(prev => ({ ...prev, isSpeaking: sourcesRef.current.size > 0 }));
                });
                sourcesRef.current.add(source);
                setState(prev => ({ ...prev, isSpeaking: true }));
            }

            // Handle Interruption
            if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setState(prev => ({ ...prev, isSpeaking: false }));
            }
          },
          onclose: () => {
            setState(prev => ({ ...prev, isConnected: false }));
          },
          onerror: (e) => {
            console.error("Live API Error", e);
            disconnect();
          }
        }
      });

    } catch (e) {
      console.error("Failed to start voice session", e);
      disconnect();
    }
  }, [state.isConnected]);

  const disconnect = useCallback(() => {
    // Cleanup Audio Contexts
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    
    // Cleanup Sources
    inputSourceRef.current?.disconnect();
    processorRef.current?.disconnect();
    sourcesRef.current.forEach(s => s.stop());
    
    // Close Session (if possible via library, otherwise just drop refs)
    // Note: The library example implies session.close() exists on the resolved session object
    sessionPromiseRef.current?.then(session => {
        // session.close(); // Hypothetical if supported by SDK, otherwise we rely on socket teardown
    });

    setState({ isConnected: false, isSpeaking: false, volume: 0 });
    nextStartTimeRef.current = 0;
  }, []);

  return {
    ...state,
    connect,
    disconnect
  };
};
