import React from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MultiSignalProps {
  ecChangePct?: number; // e.g. +18.4
  yieldChangePct?: number; // e.g. -24.2
  ruminationChangePct?: number; // e.g. -32.0
  activityChangePct?: number; // e.g. -28.0
}

export const MultiSignalCard: React.FC<MultiSignalProps> = ({
  ecChangePct = 18.4,
  yieldChangePct = -24.2,
  ruminationChangePct = -32.0,
  activityChangePct = -28.0
}) => {
  const { t } = useLanguage();

  const signals = [
    {
      name: 'Milk Electrical Conductivity',
      value: `+${ecChangePct.toFixed(1)}%`,
      trend: 'RISING',
      status: 'WARNING',
      icon: TrendingUp,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      name: 'Milk Yield (kg/day)',
      value: `${yieldChangePct.toFixed(1)}%`,
      trend: 'FALLING',
      status: 'WARNING',
      icon: TrendingDown,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      name: 'Rumination Time',
      value: `${ruminationChangePct.toFixed(1)}%`,
      trend: 'FALLING',
      status: 'WARNING',
      icon: TrendingDown,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      name: 'Activity / Movement',
      value: `${activityChangePct.toFixed(1)}%`,
      trend: 'FALLING',
      status: 'WARNING',
      icon: TrendingDown,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
    }
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">{t.multiSignalPattern}</h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
          Convergence Detected
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        Simultaneous shifts in milk conductivity, yield, rumination, and physical activity indicate early subclinical physiological variation.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {signals.map((sig, idx) => {
          const Icon = sig.icon;
          return (
            <div key={idx} className={`p-3 rounded-xl border ${sig.color} flex flex-col justify-between`}>
              <span className="text-xs font-medium text-slate-300 line-clamp-1">{sig.name}</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-extrabold">{sig.value}</span>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-normal">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Decision-Support Pattern:</strong> Multi-signal temporal convergence is a predictive ML feature pattern. It does NOT constitute medical diagnosis or confirm mastitis without CMT/SCC verification.
        </span>
      </div>
    </div>
  );
};
