
import React from 'react';

const EquationSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="mb-4">
        <h4 className="text-cyan-400/80 font-bold tracking-widest text-sm mb-2 uppercase">{`// ${title}`}</h4>
        <div className="font-mono text-gray-300 bg-slate-900/60 p-4 rounded-md text-base leading-relaxed border border-slate-700/50">
            {children}
        </div>
    </div>
);

export const TensorVis: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 fade-in-component text-gray-300">
            <h1 className="text-3xl font-orbitron font-bold text-cyan-300 tracking-wider holographic-title mb-8">SYSTEM MODEL</h1>
            <div className="max-w-3xl w-full">
                <EquationSection title="1. Level 1: Core Micro-Kernel">
                    <p>Meta-Kernel: W &isin; &#123;3,4,5,6&#125;<sup>3&times;3</sup></p>
                    <p className="mt-2">Aggregated Field: H<sup>(t)</sup><sub>x,y,z</sub> = &Sigma;<sub>(i,j,k)&isin;N</sub> R<sub>x,y,z</sub> &middot; K<sub>w<sub>i,j,k</sub></sub>(C<sup>(t)</sup><sub>i,j,k</sub>)</p>
                    <p className="text-cyan-500/80 mt-2">// R is a random axis flip/rotation operator.</p>
                </EquationSection>
                
                <EquationSection title="2. Level 2: Planar Convolution">
                    <p>Planar Layer: L<sup>(t)</sup><sub>u</sub> = F(&Sigma;<sub>(i,j)&isin;N</sub> R<sub>u</sub> &middot; H<sup>(t)</sup><sub>i,j</sub>, P)</p>
                     <p className="text-cyan-500/80 mt-2">// F is the master gate function; P is the parity operator.</p>
                </EquationSection>

                <EquationSection title="3. Level 3: 3D State Update">
                    <p>C<sup>(t+1)</sup><sub>x,y,z</sub> = Q<sub>3D</sub>(F(&Sigma;<sup>6</sup><sub>z'=1</sub> L<sup>(t)</sup><sub>x,y,z'</sub>, P, &sigma;))</p>
                    <p className="text-cyan-500/80 mt-2">// &sigma; is the Swastika Symmetry Map; Q<sub>3D</sub> is quantization.</p>
                </EquationSection>

                <EquationSection title="4. Scrambled Protection Functional (Metric)">
                    <p>&Delta;<sup>(t)</sup><sub>Swastika</sub> = ||&sigma;(C<sup>(t+1)</sup> &oplus; C<sup>(t)</sup>)||<sub>2</sub></p>
                    <p className="text-cyan-500/80 mt-2">// Primary metric tracking dynamics via a symbolic fold.</p>
                </EquationSection>

                <EquationSection title="5. Operational Discipline Metrics">
                    <p>Profile Latency: Measures computational delay.</p>
                    <p>Record Calibration: Maps simulation to device physics.</p>
                </EquationSection>
            </div>
        </div>
    );
};
