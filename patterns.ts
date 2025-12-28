
import { SIZE, DEPTH } from './constants';
import type { Lattice3D, UserPattern } from './types';

interface Pattern2D {
  name: string;
  data: number[][];
}

// These are "quadrant" patterns, designed to be mirrored.
const PATTERNS_2D: Pattern2D[] = [
  {
    name: 'Quad-Glider',
    data: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  {
      name: 'Corner Blocks',
      data: [
          [1, 1],
          [1, 1],
      ]
  },
  {
      name: 'Quad Cross',
      data: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ]
  },
  {
      name: 'Pinwheel',
      data: [
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0],
      ]
  },
  {
    name: 'Penta-Replicator',
    data: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ]
  },
  {
    name: 'Diagonal Line',
    data: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]
  },
  {
    name: 'Agitator',
    data: [
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ]
  },
];

// Helper for flattened indexing in the Uint8Array
const getIdx = (i: number, j: number, k: number, depth: number) => (i * SIZE * depth) + (j * depth) + k;

// This function creates a base 3D lattice with no active cells as a flattened Uint8Array
const createBaseLattice = (depth: number): Lattice3D => {
    return new Uint8Array(SIZE * SIZE * depth);
}


// This function places a 2D pattern in the top-left quadrant and mirrors it across both axes.
export const generateLatticeFromPattern = (pattern: number[][], depth: number): Lattice3D => {
    const baseLattice = createBaseLattice(depth);
    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;
    const middleLayer = Math.floor(depth / 2);

    // Helper to set a cell value in the flattened array
    const setCell = (r: number, c: number, value: number) => {
        if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
            baseLattice[getIdx(r, c, middleLayer, depth)] = value;
        }
    };
    
    // Place the pattern in the top-left quadrant (with an offset) and mirror it.
    const offsetX = 1;
    const offsetY = 1;

    for (let i = 0; i < patternHeight; i++) {
        for (let j = 0; j < patternWidth; j++) {
            if (pattern[i][j] === 1) {
                const r = offsetX + i;
                const c = offsetY + j;
                
                // Check bounds to ensure pattern is within a quadrant
                if (r < Math.ceil(SIZE / 2) && c < Math.ceil(SIZE / 2)) {
                    setCell(r, c, 1); // Top-left
                    setCell(r, SIZE - 1 - c, 1); // Top-right
                    setCell(SIZE - 1 - r, c, 1); // Bottom-left
                    setCell(SIZE - 1 - r, SIZE - 1 - c, 1); // Bottom-right
                }
            }
        }
    }
    return baseLattice;
};

// Default patterns are now created using the system-wide DEPTH constant for binary compatibility
export const DEFAULT_PATTERNS: UserPattern[] = PATTERNS_2D.map((p, index) => ({
  id: `default-${index}`,
  name: p.name,
  data: generateLatticeFromPattern(p.data, DEPTH), 
  isDefault: true,
}));
