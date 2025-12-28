
import { useState, useCallback, useMemo } from 'react';
import type { GlyphMapData, GlyphNode } from '../types';
import { SIZE, DEPTH } from '../constants';

const MAP_DIMENSION = 10;
const INPUT_DIMENSION = SIZE * SIZE * DEPTH;
const TOTAL_ITERATIONS = 5000; // Increased for smoother convergence
const INITIAL_LEARNING_RATE = 0.3; // Slower, more persistent learning
const INITIAL_RADIUS = MAP_DIMENSION / 1.5;

const createInitialMap = (): GlyphMapData => {
  const map: GlyphMapData = [];
  for (let i = 0; i < MAP_DIMENSION; i++) {
    const row: GlyphNode[] = [];
    for (let j = 0; j < MAP_DIMENSION; j++) {
      // Initialize with a bit more structure (slight spatial bias)
      const weights = Array.from({ length: INPUT_DIMENSION }, () => Math.random() * 0.1);
      row.push({ weights, x: i, y: j });
    }
    map.push(row);
  }
  return map;
};

export const useGlyphMap = () => {
  const [map, setMap] = useState<GlyphMapData>(createInitialMap);
  const [iteration, setIteration] = useState(0);
  const [bmu, setBmu] = useState<{ x: number, y: number } | null>(null);

  const learningRate = useMemo(() => INITIAL_LEARNING_RATE * Math.exp(-iteration / TOTAL_ITERATIONS), [iteration]);
  const neighborhoodRadius = useMemo(() => INITIAL_RADIUS * Math.exp(-iteration / TOTAL_ITERATIONS), [iteration]);

  const resetGlyphMap = useCallback(() => {
    setMap(createInitialMap());
    setIteration(0);
    setBmu(null);
  }, []);

  const trainStep = useCallback((inputVector: number[]) => {
    if (inputVector.length !== INPUT_DIMENSION) return;

    let bestNode: GlyphNode | null = null;
    let minDistance = Infinity;

    // 1. Find BMU
    for (const row of map) {
      for (const node of row) {
        let distance = 0;
        for (let i = 0; i < INPUT_DIMENSION; i++) {
            distance += (node.weights[i] - inputVector[i]) ** 2;
        }
        if (distance < minDistance) {
          minDistance = distance;
          bestNode = node;
        }
      }
    }

    if (!bestNode) return;
    setBmu({ x: bestNode.x, y: bestNode.y });

    // 2. Update weights with persistence
    const radiusSquared = neighborhoodRadius ** 2;
    const newMap = map.map(row => row.map(node => {
        const distToBmuSquared = (bestNode!.x - node.x) ** 2 + (bestNode!.y - node.y) ** 2;
        
        if (distToBmuSquared < radiusSquared) {
          const influence = Math.exp(-distToBmuSquared / (2 * radiusSquared));
          const updatedWeights = [...node.weights];
          for (let w = 0; w < INPUT_DIMENSION; w++) {
            updatedWeights[w] += influence * learningRate * (inputVector[w] - updatedWeights[w]);
          }
          return { ...node, weights: updatedWeights };
        }
        return node;
    }));

    setMap(newMap);
    setIteration(prev => prev + 1);
  }, [map, learningRate, neighborhoodRadius]);

  return { map, bmu, iteration, trainStep, resetGlyphMap };
};
