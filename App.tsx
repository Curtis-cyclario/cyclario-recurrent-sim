
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Controls } from './components/Controls';
import { Metrics } from './components/Metrics';
import { Legend } from './components/Legend';
import { PhaseScope } from './components/PhaseScope';
import { KernelEditor } from './components/KernelEditor';
import { CyclicManifold } from './components/CyclicManifold';
import { ProjectLore } from './components/ProjectLore';
import { FrameworkSpecs as FrameworkView } from './components/FrameworkSpecs';
import { Footer } from './components/Footer';
import { GeminiChatModal } from './components/GeminiChatModal';
import { useSimulation } from './hooks/useSimulation';
import { useAudio } from './hooks/useAudio';
import { InterconnectMatrix } from './components/InterconnectMatrix';
import { InterfaceSelector } from './components/InterfaceSelector';
import type { GlobalSettings, SimulationMode, PhysicsModel } from './types';
import { MicroKernelVis } from './components/MicroKernelVis';
import { VolumetricLattice } from './components/VolumetricLattice';
import { QuantizationField } from './components/QuantizationField';
import { Tutorial } from './components/Tutorial';
import { EntropyVis } from './components/EntropyVis';
import { PatternGeneratorVis } from './components/PatternGeneratorVis';
import { SignalPathways } from './components/SignalPathways';
import { useGlyphMap } from './hooks/useGlyphMap';
import { GlyphMap } from './components/GlyphMap';
import { GlobalSettingsPanel } from './components/GlobalSettingsPanel';
import { GeminiGeneratorModal } from './components/GeminiGeneratorModal';
import { LiveAnalysis } from './components/LiveAnalysis';
import { PhysicsEngine } from './components/PhysicsEngine';
import { SystemArchitecture } from './components/SystemArchitecture';
import { DEPTH } from './constants';

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
      const flattenedLattice = lattice.flat(2);
      glyphTrainStepRef.current(flattenedLattice);
    }
  }, [lattice, running, simulationMode]);


  const onStart = () => {
    initAudio();
    handleStart();
  };

  const onStop = () => {
    handleStop();
  };

  const handleModeChange = useCallback((newMode: SimulationMode) => {
    if (newMode === 'GLYPH_MAP' && simulationMode !== 'GLYPH_MAP') {
        resetGlyphMap();
    }
    setSimulationMode(newMode);
  }, [simulationMode, resetGlyphMap]);

  const handleGlobalSettingsChange = (setting: keyof GlobalSettings, value: number) => {
    setGlobalSettings(prev => ({ ...prev, [setting]: value }));
  };
  
  const handlePhysicsModelChange = (model: PhysicsModel) => {
    setPhysicsModel(model);
  };

  const handleApplyGeneratedConfig = (config: { coreGrid?: number[][]; pattern?: number[][]; }) => {
    if (config.coreGrid) {
      setCoreGrid(config.coreGrid);
    }
    if (config.pattern) {
      handleApplyGeneratedPattern(config.pattern);
    }
    setIsGeneratorOpen(false); // Close modal after applying
  };

  const isInfoPage = ['SYSTEM_ARCHITECTURE', 'PROJECT_LORE', 'FRAMEWORK'].includes(simulationMode);
  const isControlDisabled = running || isInfoPage || isPlaybackMode;
  const isInterconnectDisabled = isControlDisabled;

  // Determine what to display: live data or playback data
  const createEmptyLattice = (depth: number) => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(depth).fill(0)));
  const displayFrame = isPlaybackMode && simulationHistory.length > 0 ? simulationHistory[playbackIndex] : null;
  const displayLattice = displayFrame ? displayFrame.lattice : lattice;
  const displayPrevLattice = displayFrame ? displayFrame.prevLattice : prevLattice;
  const displayMetrics = displayFrame ? displayFrame.metrics : metrics;

  const renderVisualization = () => {
    switch (simulationMode) {
        case 'MICRO_KERNEL':
            return <MicroKernelVis coreGrid={coreGrid} lattice={displayLattice} />;
        case 'CYCLIC_MANIFOLD':
            return (
                 <CyclicManifold 
                    lattice={displayLattice} 
                    kernelFace={kernelFace}
                    onCellClick={handleCellClick}
                    showBorders={showBorders}
                    interconnects={interconnects}
                  />
            );
        case 'VOLUMETRIC_LATTICE':
            return (
                <VolumetricLattice
                    lattice={displayLattice}
                    kernelFace={kernelFace}
                    glowIntensity={globalSettings.glowIntensity}
                    interconnects={interconnects}
                />
            );
        case 'QUANTIZATION_FIELD':
            return <QuantizationField metricsHistory={metricsHistory} />;
        case 'ENTROPY_MODE':
            return <EntropyVis metricsHistory={metricsHistory} />;
        case 'PATTERN_GENERATOR':
            return <PatternGeneratorVis lattice={displayLattice} kernelFace={kernelFace} />;
        case 'SIGNAL_PATHWAYS':
            return <SignalPathways lattice={displayLattice} prevLattice={displayPrevLattice} interconnects={interconnects} />;
        case 'GLYPH_MAP':
            return <GlyphMap map={glyphMap} bmu={glyphBmu} currentInput={displayLattice.flat(2)} iteration={glyphIteration} />;
        case 'PHYSICS_EVAL':
            return <PhysicsEngine metrics={metrics} lattice={lattice} running={running} />;
        case 'SYSTEM_ARCHITECTURE':
            return <SystemArchitecture coreGrid={coreGrid} kernelFace={kernelFace} />;
        case 'PROJECT_LORE':
            return <ProjectLore />;
        case 'FRAMEWORK':
            return <FrameworkView />;
        default:
            return null;
    }
  }

  // Define explicitly which modes show the control panel based on user request
  const CONTROLS_VISIBLE_MODES: SimulationMode[] = [
      'PHYSICS_EVAL',       // Physics
      'VOLUMETRIC_LATTICE', // Qube
      'CYCLIC_MANIFOLD',    // Face
      'MICRO_KERNEL',       // Core
      'SIGNAL_PATHWAYS',    // Signal
      'PATTERN_GENERATOR'   // Pattern
  ];

  const shouldShowControls = CONTROLS_VISIBLE_MODES.includes(simulationMode);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-start p-2 sm:p-4 text-slate-300">
        <header className="relative text-center mb-4 w-full py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center font-bold text-white text-xl font-orbitron">C</div>
                <div className="text-left">
                    <h1 className="text-xl font-orbitron font-bold text-slate-100 tracking-wider">
                        CYCLARIO
                    </h1>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Photonic IC Simulator v4.1</p>
                </div>
            </div>
            <div className="mt-2 md:mt-0 flex gap-4 text-xs font-mono text-slate-500">
                <span>SUBSTRATE: Si/SiO2</span>
                <span>WAVEGUIDE: Si3N4</span>
                <span>MODULATOR: LiNbO3</span>
            </div>
          </div>
        </header>
        
        <main className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] items-start gap-4">
          
          {/* Left Column */}
          <div className="w-full flex-shrink-0 order-2 lg:order-1 flex flex-col gap-4">
            <PhaseScope metricsHistory={metricsHistory} />
            <GlobalSettingsPanel 
                settings={globalSettings} 
                onSettingsChange={handleGlobalSettingsChange} 
                isDisabled={isControlDisabled}
                physicsModel={physicsModel}
                onPhysicsModelChange={handlePhysicsModelChange}
            />
            <div className="kernel-editor-container">
                <KernelEditor 
                  coreGrid={coreGrid}
                  onGridChange={handleCoreGridChange}
                  onReset={handleResetCoreGrid}
                  isDisabled={isControlDisabled}
                  onLoadPreset={setCoreGrid}
                />
            </div>
            <InterconnectMatrix 
              channels={interconnects}
              onToggle={handleToggleInterconnect}
              isDisabled={isInterconnectDisabled}
            />
            <Legend />
          </div>

          {/* Center Column */}
          <div className="flex-grow flex flex-col items-center order-1 lg:order-2 w-full">
               <div className="w-full interface-selector-container mb-4">
                    <InterfaceSelector currentMode={simulationMode} onModeChange={handleModeChange} />
               </div>
              <div className="relative component-panel rounded-sm p-4 w-full min-h-[60vh] flex items-center justify-center lattice-container bg-slate-950">
                  <div className="relative w-full h-full flex items-center justify-center">
                      {renderVisualization()}
                  </div>
              </div>
              
              {/* Consolidated Control Panel Logic */}
              {shouldShowControls && (
                <div className="w-full mt-4 flex flex-col items-center controls-container gap-4">
                    {/* Hide standard metrics on Physics page as it has its own dashboard */}
                    {simulationMode !== 'PHYSICS_EVAL' && (
                        <Metrics metrics={displayMetrics} history={metricsHistory} />
                    )}
                    
                    <Controls
                        onStart={onStart}
                        onStop={onStop}
                        onStep={handleStep}
                        onReset={handleReset}
                        onClear={handleClear}
                        onLoadPattern={handleLoadPattern}
                        isRunning={running}
                        delay={delay}
                        effectiveDelay={effectiveDelay}
                        onDelayChange={(e) => setDelay(parseInt(e.target.value, 10))}
                        onSetDelay={setDelay}
                        patterns={patterns}
                        selectedPatternId={selectedPatternId}
                        onSavePattern={handleSavePattern}
                        onUpdatePattern={handleUpdatePattern}
                        onDeletePattern={handleDeletePattern}
                        volume={volume}
                        onVolumeChange={handleVolumeChange}
                        waveform={waveform}
                        onWaveformChange={handleWaveformChange}
                        audioSource={audioSource}
                        onAudioSourceChange={handleAudioSourceChange}
                        audioProfile={audioProfile}
                        onAudioProfileChange={handleAudioProfileChange}
                        showBorders={showBorders}
                        onToggleBorders={() => setShowBorders(p => !p)}
                        onOpenGenerator={() => setIsGeneratorOpen(true)}
                        isRecording={isRecording}
                        onToggleRecording={handleToggleRecording}
                        isPlaybackMode={isPlaybackMode}
                        simulationHistory={simulationHistory}
                        playbackIndex={playbackIndex}
                        onScrub={handleScrub}
                        onExitPlayback={handleExitPlayback}
                    />
                    
                    {/* Live Analysis usually sits at bottom, show on pages with controls except physics which has it's own stats */}
                    {simulationMode !== 'PHYSICS_EVAL' && (
                        <LiveAnalysis 
                            isRunning={running} 
                            metricsHistory={metricsHistory} 
                            coreGrid={coreGrid}
                            physicsModel={physicsModel}
                        />
                    )}
                </div>
              )}
          </div>
          
        </main>
      </div>
      <Footer onMenuClick={() => setIsModalOpen(true)} onHelpClick={() => setIsTutorialOpen(true)} />
      <GeminiChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Tutorial isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <GeminiGeneratorModal 
        isOpen={isGeneratorOpen} 
        onClose={() => setIsGeneratorOpen(false)} 
        onApply={handleApplyGeneratedConfig}
      />
    </>
  );
};

export default App;
