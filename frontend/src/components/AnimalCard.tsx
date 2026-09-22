import React from 'react';
import type { Animal } from '../types';
import { RiskGauge } from './RiskGauge';
import { TrendingUp, TrendingDown, Minus, ChevronRight, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AnimalCardProps {
  animal: Animal;
  onSelect: (animalId: string) => void;
  isFeaturedDemo?: boolean;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onSelect, isFeaturedDemo = false }) => {
  const { t } = useLanguage();
  const pred = animal.latest_prediction;

  const riskLevel = pred?.risk_level || 'NO RISK';
  const prob = pred?.risk_probability || 0.0;
  const trend = pred?.risk_trend || 'STABLE';
  const confidence = pred?.data_confidence || 'MEDIUM';

  let borderStyle = 'border-slate-800 hover:border-slate-700';
  let actionBtnColor = 'bg-slate-800 text-slate-200 hover:bg-slate-700';

  if (riskLevel === 'HIGH') {
    borderStyle = 'border-rose-500/50 bg-rose-950/20 shadow-lg shadow-rose-950/30 hover:border-rose-500';
    actionBtnColor = 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-900/40 font-bold';
  } else if (riskLevel === 'MODERATE') {
    borderStyle = 'border-amber-500/40 bg-amber-950/10 hover:border-amber-500';
    actionBtnColor = 'bg-amber-600 text-slate-950 hover:bg-amber-500 font-bold';
  }

  const TrendIcon = trend === 'RISING' ? TrendingUp : trend === 'DECLINING' ? TrendingDown : Minus;
  const trendColor = trend === 'RISING' ? 'text-rose-400' : trend === 'DECLINING' ? 'text-emerald-400' : 'text-slate-400';

  return (
    <div
      onClick={() => onSelect(animal.animal_id)}
      className={`relative p-5 rounded-2xl bg-slate-900/90 border ${borderStyle} transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between`}
    >
      {/* Featured DEMO SCENARIO Badge for COW-027 */}
      {isFeaturedDemo && (
        <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
          {t.demoScenario} • COW-027
        </div>
      )}

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">{animal.animal_id}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Lactation {animal.parity}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{animal.breed} • DIM: {animal.days_in_milk}d</p>
          </div>

          <RiskGauge probability={prob} riskLevel={riskLevel} size="sm" />
        </div>

        {/* Risk Trend & Confidence */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-800/60 border border-slate-800/80 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className="text-slate-300 font-medium">
              {trend === 'RISING' ? t.riskIsRising : trend === 'DECLINING' ? t.riskIsDeclining : t.riskIsStable}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">{t.dataConfidence}:</span>
            <span className="font-bold text-slate-200">{confidence}</span>
          </div>
        </div>

        {/* Top Factor Snippet */}
        {pred?.top_factors && pred.top_factors.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.whatChanged}:</p>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/60 text-xs text-slate-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{pred.top_factors[0].description}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400">Horizon: 7–14 days</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(animal.animal_id);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all ${actionBtnColor}`}
        >
          <span>{t.checkAnimal}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
