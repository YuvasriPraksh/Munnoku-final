import React, { useEffect, useState } from 'react';
import { fetchAnimals } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface AnimalListPageProps {
  onSelectAnimal: (animalId: string) => void;
}

interface AnimalSummary {
  animal_id: string;
  risk_level: string; // e.g., 'high', 'moderate', 'rising', 'low'
  trend: string; // 'rising' | 'stable' | 'declining'
  reason: string;
  priority: number; // lower = higher priority, matches Home ordering
}

export const AnimalListPage: React.FC<AnimalListPageProps> = ({ onSelectAnimal }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [animals, setAnimals] = useState<AnimalSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnimals = async () => {
      try {
        const rawAnimals = await fetchAnimals();
        const data: AnimalSummary[] = rawAnimals.map((a) => {
          const pred = a.latest_prediction;
          const riskLevel = pred?.risk_level || 'NO RISK';
          const priority = riskLevel === 'HIGH' ? 1 : riskLevel === 'MODERATE' ? 2 : 3;
          return {
            animal_id: a.animal_id,
            risk_level: riskLevel,
            trend: pred?.risk_trend?.toLowerCase() || 'stable',
            reason: pred?.recommendation || 'Baseline normal',
            priority,
          };
        });
        data.sort((x, y) => x.priority - y.priority);
        setAnimals(data);
      } catch (err) {
        console.error('Failed to load animal list', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnimals();
  }, [currentUser]);

  const handleCheck = (animalId: string) => {
    onSelectAnimal(animalId);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading animal list...</div>;
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white tracking-tight">{t.animals}</h1>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
          {animals.length} Animals Registered
        </span>
      </div>

      {animals.length === 0 && (
        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No animals found.
        </div>
      )}

      <div className="space-y-3">
        {animals.map((a) => {
          const isHigh = a.risk_level.toUpperCase() === 'HIGH';
          const isMod = a.risk_level.toUpperCase() === 'MODERATE';
          const pct = isHigh ? 84 : isMod ? 62 : 12;
          const barColor = isHigh ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500';

          return (
            <div
              key={a.animal_id}
              className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{a.animal_id}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                      isHigh
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isMod
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {a.risk_level.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">Risk {a.trend}</span>
                </div>

                {/* Compact Risk Progress Bar */}
                <div className="w-full max-w-sm space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-[#121212] overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <p className="text-xs text-slate-300">{a.reason}</p>
              </div>

              <button
                onClick={() => handleCheck(a.animal_id)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition-all shrink-0"
              >
                {t.checkAnimal}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimalListPage;


