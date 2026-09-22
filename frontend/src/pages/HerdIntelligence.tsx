import React, { useEffect, useState } from 'react';
import type { HerdSummary } from '../types';
import { fetchHerdSummary } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { MultiSignalCard } from '../components/MultiSignalCard';
import { Activity, ShieldAlert, ChevronRight, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface HerdIntelligenceProps {
  onSelectAnimal: (animalId: string) => void;
}

export const HerdIntelligence: React.FC<HerdIntelligenceProps> = ({ onSelectAnimal }) => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<HerdSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHerdSummary().then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  if (loading || !summary) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading herd summary analytics...</div>;
  }

  const chartData = [
    { name: 'High Risk', count: summary.high_risk_count, color: '#f43f5e' },
    { name: 'Moderate Risk', count: summary.moderate_risk_count, color: '#f59e0b' },
    { name: 'Low Risk', count: summary.low_risk_count, color: '#38bdf8' },
    { name: 'No Elevated Risk', count: summary.no_risk_count, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title — Herd at a Glance */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>{t.herdAtAGlance}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated herd risk distribution and common temporal signal changes.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
          50 Monitored Cows
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Animals Monitored</span>
          <span className="text-2xl font-black text-white">{summary.total_animals}</span>
          <span className="text-[10px] text-slate-500 block">Active Farm Records</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-1">
          <span className="text-xs font-semibold text-rose-300 block">Animals Needing Attention</span>
          <span className="text-2xl font-black text-white">{summary.high_risk_count}</span>
          <span className="text-[10px] text-rose-400 block">{summary.risk_distribution_pct.HIGH}% of Herd</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1">
          <span className="text-xs font-semibold text-amber-300 block">Rising-Risk Animals</span>
          <span className="text-2xl font-black text-white">{summary.rising_risk_count}</span>
          <span className="text-[10px] text-amber-400 block">Increasing Trend Shift</span>
        </div>

        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/40 space-y-1">
          <span className="text-xs font-semibold text-sky-300 block">Animals Needing More Data</span>
          <span className="text-2xl font-black text-white">2</span>
          <span className="text-[10px] text-sky-400 block">Limited Recent History</span>
        </div>
      </div>

      {/* Grid: Risk Distribution & Priority Animals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Herd Risk Distribution Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Herd Risk Distribution</h3>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Animals Table */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Priority Animals</h3>
          </div>

          <div className="space-y-3">
            {summary.top_priority_animals.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectAnimal(item.animal_id)}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{item.animal_id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.risk_level === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.risk_level} ({Math.round(item.risk_probability * 100)}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">Recommended Verification: CMT / SCC check</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Common Model Signal Changes */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-white">{t.commonSignalChanges}</h3>
        <MultiSignalCard />
      </div>
    </div>
  );
};
