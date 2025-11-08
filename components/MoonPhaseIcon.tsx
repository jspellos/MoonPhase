
import React from 'react';

interface MoonPhaseIconProps {
  phase: string;
  illumination: number;
}

// A more sophisticated icon component that tries to render the phase visually
export const MoonPhaseIcon: React.FC<MoonPhaseIconProps> = ({ phase, illumination }) => {
  const size = 100;
  const r = size / 2 - 2; // radius
  const cx = size / 2;
  const cy = size / 2;

  const getPath = () => {
    const lowerPhase = phase.toLowerCase();
    const percent = illumination / 100;
    
    // Calculate the x-radius for the ellipse
    const rx = Math.abs(r * (1 - 2 * (percent > 0.5 ? 1 - percent : percent)));
    const sweep = percent > 0.5 ? 1 : 0;
    
    if (lowerPhase.includes('new moon')) {
      return null; // The shadow circle covers everything
    }
    
    if (lowerPhase.includes('full moon')) {
      return <circle cx={cx} cy={cy} r={r} fill="url(#grad)" />;
    }
    
    if (lowerPhase.includes('first quarter')) {
      return <path d={`M${cx},${cy - r} A${r},${r} 0 0 1 ${cx},${cy + r} L${cx},${cy-r} Z`} fill="url(#grad)" />;
    }

    if (lowerPhase.includes('last quarter')) {
      return <path d={`M${cx},${cy - r} A${r},${r} 0 0 0 ${cx},${cy + r} L${cx},${cy-r} Z`} fill="url(#grad)" />;
    }
    
    if (lowerPhase.includes('waxing')) {
      return (
        <g>
          <path d={`M${cx},${cy - r} A${r},${r} 0 0 1 ${cx},${cy + r} L${cx},${cy-r} Z`} fill="url(#grad)" />
          <path d={`M${cx},${cy - r} A${rx},${r} 0 0 ${sweep} ${cx},${cy + r} Z`} fill="#111827" />
        </g>
      );
    }
    
    if (lowerPhase.includes('waning')) {
      return (
        <g>
          <path d={`M${cx},${cy - r} A${r},${r} 0 0 0 ${cx},${cy + r} L${cx},${cy-r} Z`} fill="url(#grad)" />
          <path d={`M${cx},${cy - r} A${rx},${r} 0 0 ${sweep} ${cx},${cy + r} Z`} fill="url(#grad)" />
        </g>
      );
    }

    return <circle cx={cx} cy={cy} r={r} fill="url(#grad)" />;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="60%" style={{stopColor: '#f0f0f0'}} />
            <stop offset="100%" style={{stopColor: '#c0c0c0'}} />
        </radialGradient>
      </defs>
      
      {/* Shadow/dark part of the moon */}
      <circle cx={cx} cy={cy} r={r} fill="#111827" />
      
      {/* Lit part of the moon */}
      {getPath()}
      
      {/* Outline */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4B5563" strokeWidth="1.5" />
    </svg>
  );
};
