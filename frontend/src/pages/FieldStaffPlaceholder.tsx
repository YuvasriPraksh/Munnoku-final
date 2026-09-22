import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { SyntheticBadge } from '../components/SyntheticBadge';

export const FieldStaffPlaceholder: React.FC = () => {
  const [animalId, setAnimalId] = useState('COW-027');
  const [milkYield, setMilkYield] = useState('22.5');
  const [ecReading, setEcReading] = useState('5.4');
  const [tempReading, setTempReading] = useState('37.8');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-24 text-slate-100 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-400" />
              <span>Field Staff Data Collection</span>
            </h1>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              👷 FIELD STAFF ROLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Record daily milk yield, conductivity, temperature, and manual field observations.
          </p>
        </div>
        <SyntheticBadge />
      </div>

      {/* Form Container */}
      <div>
        {submitted ? (
          <div className="p-6 rounded-2xl bg-[#181818] border border-emerald-500/40 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Daily Field Observation Recorded</h2>
            <p className="text-xs text-slate-300">
              Sensor readings for <strong className="text-white font-bold">{animalId}</strong> recorded in local state.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition-all min-h-[44px]"
            >
              Log Another Field Reading
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold w-fit border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Field Staff Entry Interface</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Animal ID</label>
                <input
                  type="text"
                  value={animalId}
                  onChange={(e) => setAnimalId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#2e2e2e] text-xs text-white font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Milk Yield (kg/day)</label>
                <input
                  type="number"
                  step="0.1"
                  value={milkYield}
                  onChange={(e) => setMilkYield(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#2e2e2e] text-xs text-white font-bold focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Electrical Conductivity (mS/cm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ecReading}
                  onChange={(e) => setEcReading(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#2e2e2e] text-xs text-white font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Milk Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tempReading}
                  onChange={(e) => setTempReading(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#2e2e2e] text-xs text-white font-bold focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 min-h-[44px] rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Save Field Observations</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

