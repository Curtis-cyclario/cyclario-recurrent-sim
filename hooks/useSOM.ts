
import { useState, useCallback, useMemo } from 'react';
import type { SOMMap, SOMNode } from '../types';
import { SIZE, DEPTH } from '../constants';

const MAP_DIMENSION = 10;
const INPUT_DIMENSION = SIZE * SIZE * DEPTH;
const TOTAL_ITERATIONS = 2000;
const INITIAL_LEARNING_RATE = 0.5;
const INITIAL_RADIUS = MAP_DIMENSION / 2;

const createInitialMap = (): SOMMap => {
  const map: SOMMap = [];
  for (let i = 0; i < MAP_DIMENSION; i++) {
    const row: SOMNode[] = [];
    for (let j = 0; j < MAP_DIMENSION; j++) {
      const weights = Array.from({ length: INPUT_DIMENSION }, () => Math.random());
      row.push({ weights, x: i, y: j });
    }
    map.push(row);
  }
  return map;
};

export const useSOM = () => {
  const [map, setMap] = useState<SOMMap>(createInitialMap);
  const [iteration, setIteration] = useState(0);
  const [bmu, setBmu] = useState<{ x: number, y: number } | null>(null);

  const learningRate = useMemo(() => INITIAL_LEARNING_RATE * Math.exp(-iteration / TOTAL_ITERATIONS), [iteration]);
  const neighborhoodRadius = useMemo(() => INITIAL_RADIUS * Math.exp(-iteration / TOTAL_ITERATIONS), [iteration]);

  const resetSOM = useCallback(() => {
    setMap(createInitialMap());
    setIteration(0);
    setBmu(null);
  }, []);

  const trainStep = useCallback((inputVector: number[]) => {
    if (inputVector.length !== INPUT_DIMENSION) return;

    // 1. Find Best Matching Unit (BMU)
    let bestNode: SOMNode | null = null;
    let minDistance = Infinity;

    for (const row of map) {
      for (const node of row) {
        const distance = node.weights.reduce((sum, weight, i) => sum + (weight - inputVector[i]) ** 2, 0);
        if (distance < minDistance) {
          minDistance = distance;
          bestNode = node;
        }
      }
    }

    if (!bestNode) return;
    setBmu({ x: bestNode.x, y: bestNode.y });

    // 2. Update weights
    const radiusSquared = neighborhoodRadius ** 2;
    const newMap = map.map(row => row.map(node => ({ ...node, weights: [...node.weights] })));

    for (let i = 0; i < MAP_DIMENSION; i++) {
      for (let j = 0; j < MAP_DIMENSION; j++) {
        const node = newMap[i][j];
        const distToBmuSquared = (bestNode.x - node.x) ** 2 + (bestNode.y - node.y) ** 2;

        if (distToBmuSquared < radiusSquared) {
          const influence = Math.exp(-distToBmuSquared / (2 * radiusSquared));
          for (let w = 0; w < INPUT_DIMENSION; w++) {
            node.weights[w] += influence * learningRate * (inputVector[w] - node.weights[w]);
          }
        }
      }
    }

    setMap(newMap);
    setIteration(prev => prev + 1);
  }, [map, learningRate, neighborhoodRadius, iteration]);

  return { map, bmu, iteration, trainStep, resetSOM };
};
