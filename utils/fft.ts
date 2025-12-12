
/**
 * Calculates the Fast Fourier Transform (FFT) of a real-valued signal.
 * Uses an optimized iterative Cooley-Tukey algorithm with Float64Arrays.
 * @param signal The input array of numbers. Must have a length that is a power of 2.
 * @returns An array of magnitudes for the positive frequency components.
 */
export const calculateFFT = (signal: number[]): number[] => {
  const n = signal.length;
  if (n === 0 || (n & (n - 1)) !== 0) {
    return [];
  }

  // Use typed arrays for efficient memory usage and performance
  const real = new Float64Array(signal);
  const imag = new Float64Array(n); // Zero-initialized by default

  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      // Swap real component
      const tempReal = real[i];
      real[i] = real[j];
      real[j] = tempReal;
      // Swap imag component (redundant for initially zero arrays but necessary for full FFT)
      const tempImag = imag[i];
      imag[i] = imag[j];
      imag[j] = tempImag;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Cooley-Tukey Butterfly Operations
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = -2 * Math.PI / len;
    
    // Trigonometric recurrence constants
    const wLenRe = Math.cos(angle);
    const wLenIm = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wRe = 1.0;
      let wIm = 0.0;
      
      for (let k = 0; k < halfLen; k++) {
        const evenIndex = i + k;
        const oddIndex = i + k + halfLen;

        // Butterfly Calculation
        // u = a[evenIndex]
        // v = a[oddIndex] * w
        const uRe = real[evenIndex];
        const uIm = imag[evenIndex];

        const oddRe = real[oddIndex];
        const oddIm = imag[oddIndex];

        const vRe = oddRe * wRe - oddIm * wIm;
        const vIm = oddRe * wIm + oddIm * wRe;

        real[evenIndex] = uRe + vRe;
        imag[evenIndex] = uIm + vIm;
        real[oddIndex] = uRe - vRe;
        imag[oddIndex] = uIm - vIm;

        // Update w using recurrence
        const nextWRe = wRe * wLenRe - wIm * wLenIm;
        wIm = wRe * wLenIm + wIm * wLenRe;
        wRe = nextWRe;
      }
    }
  }
  
  // Calculate magnitudes for the first half (positive frequencies + DC)
  const outputLen = n / 2;
  const magnitudes = new Array(outputLen);
  for (let i = 0; i < outputLen; i++) {
    magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
  }
  
  return magnitudes;
};

/**
 * Pads a signal to the next power of 2 length.
 * @param signal The input array of numbers.
 * @returns A new array padded with zeros.
 */
export const padSignal = (signal: number[]): number[] => {
    const len = signal.length;
    if (len === 0) return [];
    
    // Check if already power of 2
    if ((len & (len - 1)) === 0) {
        return [...signal];
    }

    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(len)));
    const padded = new Array(nextPowerOf2).fill(0);
    
    // Array copy
    for(let i=0; i < len; i++) {
        padded[i] = signal[i];
    }
    
    return padded;
};
