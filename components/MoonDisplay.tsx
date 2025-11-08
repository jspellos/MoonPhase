
import React from 'react';
import type { MoonData } from '../types';
import { MoonPhaseIcon } from './MoonPhaseIcon';

interface MoonDisplayProps {
  data: MoonData | null;
}

export const MoonDisplay: React.FC<MoonDisplayProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700/50">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          <MoonPhaseIcon phase={data.phase} illumination={data.illumination} />
        </div>
        <h2 className="text-2xl font-bold text-white">{data.phase}</h2>
        <p className="text-cyan-300 text-lg font-medium">{data.illumination.toFixed(1)}% Illuminated</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-center border-t border-gray-700 pt-6">
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wider">Moonrise</p>
          <p className="text-xl font-semibold text-gray-100">{data.moonrise}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wider">Moonset</p>
          <p className="text-xl font-semibold text-gray-100">{data.moonset}</p>
        </div>
      </div>
    </div>
  );
};
