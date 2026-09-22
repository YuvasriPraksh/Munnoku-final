import React from 'react';
import type { RiskLevel } from '../types';

interface RiskGaugeProps {
  probability: number; // 0.0 to 1.0
  riskLevel: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ probability, riskLevel, size = 'md' }) => {
  const pct = Math.round(probability * 100);

  let colorClass = 'text-emerald-400 stroke-emerald-500';
  let bgClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

  if (riskLevel === 'HIGH') {
    colorClass = 'text-rose-400 stroke-rose-500';
    bgClass = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  } else if (riskLevel === 'MODERATE') {
    colorClass = 'text-amber-400 stroke-amber-500';
    bgClass = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  } else if (riskLevel === 'LOW') {
    colorClass = 'text-sky-400 stroke-sky-500';
    bgClass = 'bg-sky-500/10 border-sky-500/30 text-sky-400';
  }

  const dimensions = size === 'sm' ? 64 : size === 'lg' ? 120 : 88;
  const strokeWidth = size === 'sm' ? 6 : size === 'lg' ? 10 : 8;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={dimensions} height={dimensions} className="transform -rotate-90">
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-extrabold ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-xs' : 'text-base'} text-white`}>
            {pct}%
          </span>
          {size === 'lg' && <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Risk</span>}
        </div>
      </div>
      <div className={`mt-2 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold tracking-wider uppercase ${bgClass}`}>
        {riskLevel}
      </div>
    </div>
  );
};
