
import React, { useState, useRef, useCallback } from 'react';
import type { Waveform, MetricsData, AudioSourceMetric, AudioProfile } from '../types';

// Normalization constants
const MAX_DELTA_FOR_AUDIO = 40;

export const useAudio = () => {
    const [volume, setVolume] = useState(0.3);
    const [waveform, setWaveform] = useState<Waveform>('sine');
    const [audioSource, setAudioSource] = useState<AudioSourceMetric>('energy');
    const [audioProfile, setAudioProfile] = useState<AudioProfile>('synth_blip');
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const noiseBufferRef = useRef<AudioBuffer | null>(null);
    const isAudioInitializedRef = useRef<boolean>(false);

    const initAudio = useCallback(() => {
        if (isAudioInitializedRef.current || typeof window === 'undefined') return;
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (context.state === 'suspended') context.resume();
            
            const gainNode = context.createGain();
            gainNode.gain.value = volume;
            gainNode.connect(context.destination);
            
            // Create a reusable white noise buffer
            const bufferSize = context.sampleRate * 1; // 1 second of noise
            const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            noiseBufferRef.current = buffer;

            audioContextRef.current = context;
            masterGainRef.current = gainNode;
            isAudioInitializedRef.current = true;
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
    }, [volume]);

    const playFeedbackSound = useCallback((metrics: MetricsData) => {
        if (!isAudioInitializedRef.current || !audioContextRef.current || !masterGainRef.current) return;
        
        const context = audioContextRef.current;
        const masterGain = masterGainRef.current;
        const now = context.currentTime;
        
        const rawValue = metrics[audioSource] || 0;
        let normalizedValue = 0;

        switch(audioSource) {
            case 'energy':
            case 'thermalLoad':
                normalizedValue = rawValue;
                break;
            case 'delta_swastika':
                normalizedValue = Math.min(1, rawValue / MAX_DELTA_FOR_AUDIO);
                break;
        }

        if (normalizedValue <= 0) return;

        const soundVolume = 0.1 + normalizedValue * 0.2;

        switch(audioProfile) {
            case 'synth_blip': {
                const baseFreq = 200;
                const freqRange = 800;
                const frequency = baseFreq + normalizedValue * freqRange;
        
                const oscillator = context.createOscillator();
                const blipGain = context.createGain();
                
                oscillator.type = waveform;
                oscillator.frequency.setValueAtTime(frequency, now);
                blipGain.gain.setValueAtTime(0, now);
                blipGain.gain.linearRampToValueAtTime(soundVolume, now + 0.02);
                blipGain.gain.linearRampToValueAtTime(0, now + 0.1);
                
                oscillator.connect(blipGain);
                blipGain.connect(masterGain);
                
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
            }
            case 'thermal_noise': {
                if (!noiseBufferRef.current) return;
                
                const baseCutoff = 400;
                const cutoffRange = 8000;
                const cutoffFreq = baseCutoff + normalizedValue * cutoffRange;

                const noiseSource = context.createBufferSource();
                noiseSource.buffer = noiseBufferRef.current;
                
                const filter = context.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(cutoffFreq, now);

                const noiseGain = context.createGain();
                noiseGain.gain.setValueAtTime(0, now);
                noiseGain.gain.linearRampToValueAtTime(soundVolume * 0.5, now + 0.03); // Noise is perceived louder
                noiseGain.gain.linearRampToValueAtTime(0, now + 0.15);

                noiseSource.connect(filter);
                filter.connect(noiseGain);
                noiseGain.connect(masterGain);
                
                noiseSource.start(now);
                noiseSource.stop(now + 0.2);
                break;
            }
        }
    }, [waveform, audioSource, audioProfile]);
    
    const setMasterVolume = useCallback((level: number) => {
        if (masterGainRef.current && audioContextRef.current) {
            masterGainRef.current.gain.linearRampToValueAtTime(level, audioContextRef.current.currentTime + 0.05);
        }
    }, []);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setMasterVolume(newVolume);
    };

    const handleWaveformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setWaveform(e.target.value as Waveform);
    };
    
    const handleAudioSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAudioSource(e.target.value as AudioSourceMetric);
    };

    const handleAudioProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAudioProfile(e.target.value as AudioProfile);
    };

    return {
        volume,
        waveform,
        audioSource,
        audioProfile,
        initAudio,
        playFeedbackSound,
        handleVolumeChange,
        handleWaveformChange,
        handleAudioSourceChange,
        handleAudioProfileChange,
    };
};
