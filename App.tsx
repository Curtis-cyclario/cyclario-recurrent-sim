
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Controls } from './components/Controls';
import { Metrics } from './components/Metrics';
import { Legend } from './components/Legend';
import { PhaseScope } from './components/PhaseScope';
import { KernelEditor } from './components/KernelEditor';
import { PlanarArray } from './components/PlanarArray';
import { ProjectLore } from './components/ProjectLore';
import { SystemDossier } from './components/SystemDossier';
import { Footer } from './components/Footer';
import { GeminiChatModal } from './components/GeminiChatModal';
import { useSimulation } from './hooks/useSimulation';
import { useAudio } from './hooks/useAudio';
import { InterconnectMatrix } from './components/InterconnectMatrix';
import { InterfaceSelector } from './components/InterfaceSelector';
import type { GlobalSettings, SimulationMode, PhysicsModel } from './types';
import { KernelProcessor } from './components/KernelProcessor';
import { VolumetricStack } from './components/VolumetricStack';
import { HeliostatEngine } from './components/HeliostatEngine';
import { Tutorial } from './components/Tutorial';
import { EntropyRefractor } from './components/EntropyRefractor';
import { PatternGeneratorVis } from './components/PatternGeneratorVis';
import { PathwaysMonitor } from './components/PathwaysMonitor';
import { useGlyphMap } from './hooks/useGlyphMap';
import { SignalGlyphSOM } from './components/SignalGlyphSOM';
import { GlobalSettingsPanel } from './components/GlobalSettingsPanel';
import { GeminiGeneratorModal } from './components/GeminiGeneratorModal';
import { LiveAnalysis } from './components/LiveAnalysis';
import { PhysicsValidator } from './components/PhysicsValidator';
import { SystemArchitecture } from './components/SystemArchitecture';
import { VoiceHUD } from './components/VoiceHUD';

const App: React.FC = () => {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    recurrenceDepth: 1,
    particleDensity: 0.05,
    glowIntensity: 1.0,
  });
  const [physicsModel, setPhysicsModel] = useState<PhysicsModel>('standard');

  const {
    lattice, prevLattice, coreGrid, kernelFace, running, metrics, delay,
    effectiveDelay, selectedPatternId, patterns, showBorders, metricsHistory, interconnects,
    isRecording, isPlaybackMode, simulationHistory, playbackIndex,
    handleStep, handleReset, handleLoadPattern, handleCellClick,
    handleCoreGridChange, handleResetCoreGrid, setRunning, setDelay,
    setShowBorders, handleClear, handleToggleInterconnect,
    handleSavePattern, handleUpdatePattern, handleDeletePattern,
    setCoreGrid, handleApplyGeneratedPattern,
    handleStart, handleStop, handleToggleRecording, handleExitPlayback, handleScrub
  } = useSimulation({ globalSettings, physicsModel });

  const {
    volume, waveform, audioSource, audioProfile, playFeedbackSound,
    handleVolumeChange, handleWaveformChange, initAudio, 
    handleAudioSourceChange, handleAudioProfileChange
  } = useAudio();

  const { map: glyphMap, bmu: glyphBmu, iteration: glyphIteration, trainStep: glyphTrainStep, resetGlyphMap } = useGlyphMap();

  useEffect(() => {
    if(running && metrics && !isPlaybackMode) {
      playFeedbackSound(metrics);
    }
  }, [running, metrics, playFeedbackSound, isPlaybackMode]);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('PHYSICS_EVAL');

  const glyphTrainStepRef = useRef(glyphTrainStep);
  useEffect(() => {
    glyphTrainStepRef.current = glyphTrainStep;
  }, [glyphTrainStep]);

  useEffect(() => {
    if (running && simulationMode === 'GLYPH_MAP' && lattice) {
      // Lattice is already flattened Uint8Array, no need for .flat()
      glyphTrainStepRef.current(Array.from(lattice));
    }
  }, [lattice, running, simulationMode]);


  const onStart = () => { initAudio(); handleStart(); };
  const onStop = () => { handleStop(); };

  const handleModeChange = useCallback((newMode: SimulationMode) => {
    if (newMode === 'GLYPH_MAP' && simulationMode !== 'GLYPH_MAP') {
        resetGlyphMap();
    }
    setSimulationMode(newMode);
  }, [simulationMode, resetGlyphMap]);

  const handleGlobalSettingsChange = (setting: keyof GlobalSettings, value: number) => {
    setGlobalSettings(prev => ({ ...prev, [setting]: value }));
  };
  
  const handlePhysicsModelChange = (model: PhysicsModel) => { setPhysicsModel(model); };

  const handleApplyGeneratedConfig = (config: { coreGrid?: number[][]; pattern?: number[][]; }) => {
    if (config.coreGrid) setCoreGrid(config.coreGrid);
    if (config.pattern) handleApplyGeneratedPattern(config.pattern);
    setIsGeneratorOpen(false);
  };

  const isInfoPage = ['SYSTEM_ARCHITECTURE', 'PROJECT_LORE', 'FRAMEWORK'].includes(simulationMode);
  const isControlDisabled = running || isInfoPage || isPlaybackMode;

  const displayFrame = isPlaybackMode && simulationHistory.length > 0 ? simulationHistory[playbackIndex] : null;
  const displayLattice = displayFrame ? displayFrame.lattice : lattice;
  const displayPrevLattice = displayFrame ? displayFrame.prevLattice : prevLattice;
  const displayMetrics = displayFrame ? displayFrame.metrics : metrics;

  const renderVisualization = () => {
    switch (simulationMode) {
        case 'MICRO_KERNEL': return <KernelProcessor coreGrid={coreGrid} lattice={displayLattice} />;
        case 'CYCLIC_MANIFOLD': return (
             <PlanarArray lattice={displayLattice} kernelFace={kernelFace} onCellClick={handleCellClick} showBorders={showBorders} interconnects={interconnects} />
        );
        case 'VOLUMETRIC_LATTICE': return (
            <VolumetricStack lattice={displayLattice} kernelFace={kernelFace} glowIntensity={globalSettings.glowIntensity} interconnects={interconnects} />
        );
        case 'QUANTIZATION_FIELD': return <HeliostatEngine metricsHistory={metricsHistory} />;
        case 'ENTROPY_MODE': return <EntropyRefractor metricsHistory={metricsHistory} />;
        case 'PATTERN_GENERATOR': return <PatternGeneratorVis lattice={displayLattice} kernelFace={kernelFace} />;
        case 'SIGNAL_PATHWAYS': return <PathwaysMonitor lattice={displayLattice} prevLattice={displayPrevLattice} interconnects={interconnects} />;
        case 'GLYPH_MAP': return <SignalGlyphSOM map={glyphMap} bmu={glyphBmu} currentInput={Array.from(displayLattice)} iteration={glyphIteration} />;
        case 'PHYSICS_EVAL': return <PhysicsValidator metrics={metrics} lattice={lattice} running={running} />;
        case 'SYSTEM_ARCHITECTURE': return <SystemArchitecture coreGrid={coreGrid} kernelFace={kernelFace} />;
        case 'PROJECT_LORE': return <ProjectLore />;
        case 'FRAMEWORK': return <SystemDossier />;
        default: return null;
    }
  }

  const CONTROLS_VISIBLE_MODES: SimulationMode[] = ['PHYSICS_EVAL', 'VOLUMETRIC_LATTICE', 'CYCLIC_MANIFOLD', 'MICRO_KERNEL', 'SIGNAL_PATHWAYS', 'PATTERN_GENERATOR', 'ENTROPY_MODE'];
  const shouldShowControls = CONTROLS_VISIBLE_MODES.includes(simulationMode);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-6 text-slate-100 selection:bg-cyan-500/30">
        <header className="relative w-full py-8 mb-8 border-b border-slate-800/40 bg-slate-900/10 backdrop-blur-xl">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between px-8">
            <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-cyan-600/10 border border-cyan-500/40 rounded-sm flex items-center justify-center font-black text-cyan-400 text-3xl font-orbitron shadow-[0_0_20px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all">C</div>
                <div className="text-left">
                    <h1 className="text-4xl font-orbitron font-extrabold text-white tracking-[0.25em] text-glow uppercase">
                        Cyclario
                    </h1>
                    <p className="text-cyan-500/40 text-[10px] font-mono uppercase tracking-[0.5em] mt-1">Branchalletiel Computational Space v4.2</p>
                </div>
            </div>
            <div className="mt-8 md:mt-0 flex gap-10 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-[0.2em]">
                <div className="flex flex-col gap-1"><span className="text-slate-600 text-[8px]">PIC Substrate</span><span className="text-cyan-300">Silicon Nitride</span></div>
                <div className="flex flex-col gap-1 border-l border-slate-800/60 pl-8"><span className="text-slate-600 text-[8px]">Logic Protocol</span><span className="text-indigo-400">Photonic DSL</span></div>
                <div className="flex flex-col gap-1 border-l border-slate-800/60 pl-8"><span className="text-slate-600 text-[8px]">Engine Status</span><span className={running ? "text-emerald-400 animate-pulse" : "text-amber-400"}>{running ? "EXECUTING_COHERENT" : "IDLE_STANDBY"}</span></div>
            </div>
          </div>
        </header>
        
        <main className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] items-start gap-8 mb-16">
          
          <div className="w-full flex-shrink-0 order-2 lg:order-1 flex flex-col gap-8">
            <PhaseScope metricsHistory={metricsHistory} />
            <div className="space-y-8">
                <GlobalSettingsPanel settings={globalSettings} onSettingsChange={handleGlobalSettingsChange} isDisabled={isControlDisabled} physicsModel={physicsModel} onPhysicsModelChange={handlePhysicsModelChange} />
                <KernelEditor coreGrid={coreGrid} onGridChange={handleCoreGridChange} onReset={handleResetCoreGrid} isDisabled={isControlDisabled} onLoadPreset={setCoreGrid} />
                <InterconnectMatrix channels={interconnects} onToggle={handleToggleInterconnect} isDisabled={isControlDisabled} />
                <Legend />
            </div>
          </div>

          <div className="flex-grow flex flex-col items-center order-1 lg:order-2 w-full min-w-0">
               <div className="w-full mb-6">
                    <InterfaceSelector currentMode={simulationMode} onModeChange={handleModeChange} />
               </div>
              
              <div className="relative w-full group overflow-hidden scanlines rounded-sm">
                  <div className="component-panel p-8 w-full min-h-[72vh] flex items-center justify-center bg-slate-950/90 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] border-slate-800/60">
                      <div className="absolute top-6 left-8 flex items-center gap-3 pointer-events-none opacity-40 group-hover:opacity-100 transition-all duration-700">
                        <div className="w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                        <span className="hud-label !text-[8px]">{simulationMode.replace('_', ' ')} REALTIME_BUFFER</span>
                      </div>
                      <div className="relative w-full h-full flex items-center justify-center fade-in-component">
                          {renderVisualization()}
                      </div>
                  </div>
              </div>
              
              {shouldShowControls && (
                <div className="w-full mt-8 flex flex-col items-center gap-8 fade-in-component" style={{animationDelay: '0.2s'}}>
                    {simulationMode !== 'PHYSICS_EVAL' && <Metrics metrics={displayMetrics} history={metricsHistory} />}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8 w-full items-start">
                         <div className="flex flex-col gap-8">
                             <Controls
                                onStart={onStart} onStop={onStop} onStep={handleStep} onReset={handleReset} onClear={handleClear}
                                onLoadPattern={handleLoadPattern} isRunning={running} delay={delay} effectiveDelay={effectiveDelay}
                                onDelayChange={(e) => setDelay(parseInt(e.target.value, 10))} onSetDelay={setDelay} patterns={patterns}
                                selectedPatternId={selectedPatternId} onSavePattern={handleSavePattern} onUpdatePattern={handleUpdatePattern}
                                onDeletePattern={handleDeletePattern} volume={volume} onVolumeChange={handleVolumeChange} waveform={waveform}
                                onWaveformChange={handleWaveformChange} audioSource={audioSource} onAudioSourceChange={handleAudioSourceChange}
                                audioProfile={audioProfile} onAudioProfileChange={handleAudioProfileChange} showBorders={showBorders}
                                onToggleBorders={() => setShowBorders(p => !p)} onOpenGenerator={() => setIsGeneratorOpen(true)}
                                isRecording={isRecording} onToggleRecording={handleToggleRecording} isPlaybackMode={isPlaybackMode}
                                simulationHistory={simulationHistory} playbackIndex={playbackIndex} onScrub={handleScrub} onExitPlayback={handleExitPlayback}
                            />
                         </div>
                         <div className="w-full">
                            {simulationMode !== 'PHYSICS_EVAL' && (
                                <LiveAnalysis isRunning={running} metricsHistory={metricsHistory} coreGrid={coreGrid} physicsModel={physicsModel} />
                            )}
                         </div>
                    </div>
                </div>
              )}
          </div>
        </main>
      </div>
      <VoiceHUD />
      <Footer onMenuClick={() => setIsModalOpen(true)} onHelpClick={() => setIsTutorialOpen(true)} />
      <GeminiChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Tutorial isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <GeminiGeneratorModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} onApply={handleApplyGeneratedConfig} />
    </>
  );
};

export default App;
