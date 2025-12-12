
export type Lattice3D = number[][][];

export interface MetricsData {
  delta_swastika: number;
  latency: number;
  energy: number;
  thermalLoad: number;
}

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export type AudioSourceMetric = 'energy' | 'thermalLoad' | 'delta_swastika';
export type AudioProfile = 'synth_blip' | 'thermal_noise';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface UserPattern {
  id: string;
  name: string;
  data: Lattice3D;
  isDefault?: boolean;
  interconnects?: {
    rows: boolean[];
    cols: boolean[];
  };
  coreGrid?: number[][];
}

export type SimulationMode = 
  | 'MICRO_KERNEL' 
  | 'CYCLIC_MANIFOLD' 
  | 'VOLUMETRIC_LATTICE' 
  | 'QUANTIZATION_FIELD' 
  | 'KERNEL_ARCHITECTURE' 
  | 'SYSTEM_MODEL' 
  | 'CORE_CONCEPTS' 
  | 'PROJECT_LORE' 
  | 'FRAMEWORK' 
  | 'ENTROPY_MODE' 
  | 'PATTERN_GENERATOR' 
  | 'SIGNAL_PATHWAYS' 
  | 'GLYPH_MAP';

export interface GlyphNode {
  weights: number[];
  x: number;
  y: number;
}
export type GlyphMapData = GlyphNode[][];

// Added to support SOM components
export type SOMNode = GlyphNode;
export type SOMMap = GlyphMapData;

export interface GlobalSettings {
  recurrenceDepth: number;
  particleDensity: number;
  glowIntensity: number;
}

export type PhysicsModel = 'standard' | 'lagrangian' | 'wave_dynamics';
