

export const SIZE = 9;
export const DEPTH = 6;

// --- Cortical Module Weights ---
export const INTRA_MODULE_WEIGHT = 1.0; // Communication within a 3x3 module
export const INTER_MODULE_WEIGHT = 0.5; // Communication between 3x3 modules
export const INTERCONNECT_WEIGHT = 0.15; // Long-range optical interconnect influence

// Defines the rows/columns used for long-range interconnects
export const INTERCONNECT_CHANNELS = [1, 4, 7];

// --- Kernel color map for active cells based on their underlying gate type ---
export const COLORS: { [key: number]: string } = {
  3: "#00aaff", // XOR -> Electric Blue
  4: "#9933ff", // Threshold -> Violet
  5: "#00ffcc", // Memory -> Teal
  6: "#ff5500", // NOT -> Vibrant Orange-Red
};

// State is now binary (0 or 1), so refractory colors are no longer used for cell state,
// but can be kept for other UI elements or future use.
export const REFRACTORY_COLORS: { [key: number]: string } = {
  3: "#005580", // Dark Blue
  4: "#4d1a80", // Dark Violet
  5: "#008066", // Dark Teal
  6: "#802b00", // Dark Orange-Red
};

// Color for inactive cells is now a single dark color, but we keep the gate-specific
// ones for potential use in backgrounds or UI elements.
export const INACTIVE_COLORS: { [key: number]: string } = {
  3: "#002233", // Very Dark Blue for XOR
  4: "#260d40", // Very Dark Violet for Threshold
  5: "#003329", // Very Dark Teal for Memory
  6: "#401500", // Very Dark Orange-Red for NOT
};

export const GATE_NAMES: { [key: number]: string } = {
  3: 'XOR',
  4: 'THRESHOLD',
  5: 'MEMORY',
  6: 'NOT',
};

export const GATE_DESCRIPTIONS: { [key: number]: string } = {
  3: 'XOR: Cell becomes active if neighbor sum is odd; otherwise, it becomes inactive.',
  4: 'THRESHOLD: Cell becomes active if neighbor sum is >= 2; otherwise, it becomes inactive.',
  5: 'MEMORY: Sets (activates) on sum 1. Resets (deactivates) on sum > 1. Holds state otherwise.',
  6: 'NOT: Cell becomes active if neighbor sum is 0; otherwise, it becomes inactive.',
};

// --- Background colors for Kernel Editor selects ---
export const GATE_BG_COLORS: { [key: number]: string } = {
  3: 'bg-blue-900/60 hover:bg-blue-800/60 border-blue-700/80',
  4: 'bg-violet-900/60 hover:bg-violet-800/60 border-violet-700/80',
  5: 'bg-teal-900/60 hover:bg-teal-800/60 border-teal-700/80',
  6: 'bg-orange-900/60 hover:bg-orange-800/60 border-orange-700/80',
}


// --- 3x3 core defining the gate types ---
export const DEFAULT_CORE_GRID: number[][] = [
  [3, 4, 3],
  [5, 6, 5],
  [3, 4, 3]
];

// --- Array of gate types for evolution logic ---
export const GATE_TYPES = [3, 4, 5, 6];

// --- System Instruction for Gemini Chatbot ---
export const SYSTEM_INSTRUCTION = `You are an expert representative for a cutting-edge technology project, speaking to potential investors. Your tone is professional, confident, and knowledgeable. You are explaining the "Recurrent Automaton" project and its core technology, the "Cohesive Toroidal Engine".

Here is the key information you must use to answer questions:

**Core Technology:**
- The simulator demonstrates a proprietary **Cohesive Toroidal Engine**, a novel computational framework.
- It's based on recurrent, neuromorphic cellular automata.
- Unlike traditional linear processing, the architecture uses a cyclical, multi-dimensional logic flow where information perpetually wraps around all axes (a toroidal topology). This creates a highly dynamic, self-organizing system.
- The system supports **Optical Interconnects**, which are user-gated channels that enable long-range information transfer, bypassing local connections for high-speed, parallel processing.

**Market Differentiator:**
- The engine's logic is defined by a compact, editable 3x3 "Kernel".
- This kernel's rules are mirrored to govern the entire large-scale system.
- This represents a paradigm shift in scalable AI and complex system modeling, enabling rapid prototyping of computational fabrics for tasks requiring high adaptability and low energy consumption. The complexity emerges from a simple, efficient ruleset.

**Investment Opportunity:**
- The project is seeking partners to fund the development of hardware-accelerated prototypes (FPGAs/ASICs).
- Key application verticals include:
  1.  **Next-Generation AI:** Building more resilient, efficient, and adaptable neural networks.
  2.  **Recursive Robotics:** Enabling robots to learn and adapt motor control in real-time without massive pre-trained models.
  3.  **Photonic Computing:** Designing optical processors that compute at the speed of light, where toroidal data flows are a natural fit.
  4.  **Financial Modeling:** Simulating complex, non-linear market dynamics with higher fidelity.

When asked a question, provide a concise but thorough answer based *only* on this information. Be prepared to elaborate on any of these points. Do not invent new information.
`;
export interface KernelPreset {
  name: string;
  grid: number[][];
}

export const KERNEL_PRESETS: KernelPreset[] = [
  {
    name: 'Standard',
    grid: DEFAULT_CORE_GRID,
  },
  {
    name: 'Chaotic Growth',
    grid: [
      [6, 3, 6],
      [3, 4, 3],
      [6, 3, 6]
    ],
  },
  {
    name: 'Oscillator',
    grid: [
      [4, 5, 4],
      [5, 3, 5],
      [4, 5, 4]
    ],
  },
  {
    name: 'Blockade',
    grid: [
      [5, 5, 5],
      [5, 6, 5],
      [5, 5, 5]
    ],
  }
];