import React, { useEffect, useState } from 'react';
import type { Animal, SensorReading } from '../types';
import { fetchAnimals, fetchSensorHistory } from '../services/api';
import { CheckCircle2, Activity, ArrowRight, Eye, ClipboardCheck, Users, Bell } from 'lucide-react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

interface FarmerHomeProps {
  onSelectAnimal: (animalId: string) => void;
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({ onSelectAnimal }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [trendHistory, setTrendHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedChecks, setCompletedChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([fetchAnimals(), fetchSensorHistory('COW-027')]).then(([aData, hData]) => {
      setAnimals(aData);
      setTrendHistory(hData.slice(-14)); // last 14 days
      setLoading(false);
    });
  }, []);

  const needsAttentionAnimals = animals.filter(a => a.latest_prediction?.risk_level === 'HIGH');
  const watchAnimals = animals.filter(a => a.latest_prediction?.risk_level === 'MODERATE' || a.latest_prediction?.risk_trend === 'RISING');
  const healthyAnimals = animals.filter(a => a.latest_prediction?.risk_level === 'NO RISK' || a.latest_prediction?.risk_level === 'LOW');
  const dataCheckAnimals = animals.filter(a => a.latest_prediction?.data_confidence === 'INSUFFICIENT' || a.latest_prediction?.data_confidence === 'LOW');

  const toggleCheck = (id: string) => {
    setCompletedChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs font-mono">
        Loading MUNNOKKU Farm Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 text-slate-100 font-sans">
      {/* 1. Header Banner */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐄</span>
            <span className="text-lg font-black tracking-tight text-white">MUNNOKKU</span>
          </div>
          <p className="text-[11px] text-teal-400 font-medium mt-0.5">AI for Healthier Cattle, Stronger Farmers</p>
          <div className="mt-3 space-y-0.5">
            <h1 className="text-xl font-bold text-white">Good morning, Farmer</h1>
            <p className="text-xs text-slate-400">Farm 001 • Today's mastitis risk check is ready.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 rounded-full bg-[#1e1e1e] text-slate-300 text-[11px] font-semibold border border-[#333]">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 2. Key Metrics Grid (Compact 2x2) */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1">
            <span className="text-[11px] text-emerald-400 font-semibold block">Healthy / Baseline</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{healthyAnimals.length}</span>
              <span className="text-xs text-slate-400">of {animals.length}</span>
            </div>
            <span className="text-[10px] text-slate-500 block">No elevated risk</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1">
            <span className="text-[11px] text-amber-400 font-semibold block">At Risk / Watch</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{watchAnimals.length}</span>
              <span className="text-xs text-slate-400">needs check</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Monitor trend</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-rose-500/30 bg-rose-950/20 space-y-1">
            <span className="text-[11px] text-rose-400 font-semibold block">High Risk</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{needsAttentionAnimals.length}</span>
              <span className="text-xs text-rose-400 font-bold">action needed</span>
            </div>
            <span className="text-[10px] text-slate-400 block">Immediate review</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Data Needs Check</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{dataCheckAnimals.length}</span>
              <span className="text-xs text-slate-500">animals</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Incomplete history</span>
          </div>
        </div>
      </div>

      {/* 3. AI Predictions Section */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Predictions</h2>
            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
              LIVE / TODAY
            </span>
          </div>
          <span className="text-[11px] text-slate-400">7–14 Day Early Warning</span>
        </div>

        <div className="space-y-2.5">
          {animals.map((animal) => {
            const pred = animal.latest_prediction;
            const prob = pred?.risk_probability || 0;
            const riskLevel = pred?.risk_level || 'NO RISK';
            const pct = Math.round(prob * 100);

            const isHigh = riskLevel === 'HIGH';
            const isMod = riskLevel === 'MODERATE';

            const barColor = isHigh ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500';
            const textColor = isHigh ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-emerald-400';

            return (
              <div
                key={animal.animal_id}
                onClick={() => onSelectAnimal(animal.animal_id)}
                className="p-3.5 rounded-xl bg-[#202020] border border-[#2e2e2e] hover:border-teal-500/50 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="w-24 shrink-0">
                  <span className="text-xs font-bold text-white block">{animal.animal_id}</span>
                  <span className="text-[10px] text-slate-400">{animal.breed.split(' ')[0]}</span>
                </div>

                {/* Compact Risk Bar */}
                <div className="flex-1 max-w-xs space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Forecast Risk</span>
                    <span className={`font-bold ${textColor}`}>{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#121212] overflow-hidden">
                    <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Risk Level Badge & Trend */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    isHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    isMod ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {riskLevel}
                  </span>
                  <button className="p-1 rounded bg-[#2a2a2a] text-slate-300 hover:text-white">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Data Trends & 5. Today's Checks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Data Trends Card */}
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Data Trends (COW-027 EC vs Yield)</span>
            </h2>
            <span className="text-[10px] text-slate-500">Last 14 Days</span>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendHistory}>
                <Tooltip contentStyle={{ backgroundColor: '#181818', borderColor: '#333', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="electrical_conductivity" name="EC (mS/cm)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="milk_yield_kg" name="Yield (kg)" stroke="#40c0c0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#262626]">
            <span className="flex items-center gap-1 text-rose-400">● Electrical Conductivity (EC) ↑</span>
            <span className="flex items-center gap-1 text-teal-400">● Milk Yield (kg) ↓</span>
          </div>
        </div>

        {/* Today's Checks Checklist */}
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Today's Action Items</span>
          </h2>

          <div className="space-y-2 pt-1">
            <div
              onClick={() => onSelectAnimal('COW-027')}
              className="p-3 rounded-xl bg-[#202020] border border-rose-500/30 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#262626]"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={!!completedChecks['COW-027']}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleCheck('COW-027');
                  }}
                  className="w-4 h-4 accent-teal-500 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Check COW-027</span>
                  <span className="text-[10px] text-rose-400">High future risk (84%) • EC +18%</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                Immediate
              </span>
            </div>

            <div
              onClick={() => onSelectAnimal('COW-012')}
              className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e] flex items-center justify-between gap-3 cursor-pointer hover:bg-[#262626]"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={!!completedChecks['COW-012']}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleCheck('COW-012');
                  }}
                  className="w-4 h-4 accent-teal-500 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Check COW-012</span>
                  <span className="text-[10px] text-amber-400">Watchlist • Conductivity rising</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Today
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={!!completedChecks['verify']}
                  onChange={() => toggleCheck('verify')}
                  className="w-4 h-4 accent-teal-500 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Review CMT Logs</span>
                  <span className="text-[10px] text-slate-400">Log routine CMT scores for high risk animals</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Quick Actions Row */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onSelectAnimal('COW-027')}
            className="p-3.5 rounded-xl bg-[#181818] border border-[#2a2a2a] hover:border-teal-500/60 transition-all text-left space-y-1 min-h-[44px]"
          >
            <Eye className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-white block">View Predictions</span>
            <span className="text-[10px] text-slate-400 block">Check 7–14d forecast</span>
          </button>

          <button
            onClick={() => onSelectAnimal('COW-027')}
            className="p-3.5 rounded-xl bg-[#181818] border border-[#2a2a2a] hover:border-teal-500/60 transition-all text-left space-y-1 min-h-[44px]"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white block">Record Verification</span>
            <span className="text-[10px] text-slate-400 block">CMT / SCC logs</span>
          </button>

          <button
            onClick={() => onSelectAnimal('COW-012')}
            className="p-3.5 rounded-xl bg-[#181818] border border-[#2a2a2a] hover:border-teal-500/60 transition-all text-left space-y-1 min-h-[44px]"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white block">View Animals</span>
            <span className="text-[10px] text-slate-400 block">Registered cows ({animals.length})</span>
          </button>

          <button
            onClick={() => onSelectAnimal('COW-027')}
            className="p-3.5 rounded-xl bg-[#181818] border border-[#2a2a2a] hover:border-teal-500/60 transition-all text-left space-y-1 min-h-[44px]"
          >
            <Bell className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-white block">View Alerts</span>
            <span className="text-[10px] text-slate-400 block">Risk notifications</span>
          </button>
        </div>
      </div>
    </div>
  );
};

