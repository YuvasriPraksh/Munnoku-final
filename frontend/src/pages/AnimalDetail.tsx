import React, { useEffect, useState } from 'react';
import type { Animal, SensorReading } from '../types';
import { fetchAnimalDetail, fetchSensorHistory } from '../services/api';
import { RiskGauge } from '../components/RiskGauge';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, AlertTriangle, ShieldCheck, ClipboardCheck, Activity, Database, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface AnimalDetailProps {
  animalId: string;
  onBack: () => void;
  onOpenVerification: (animalId: string) => void;
}

export const AnimalDetail: React.FC<AnimalDetailProps> = ({ animalId, onBack, onOpenVerification }) => {
  const { t } = useLanguage();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVetToast, setShowVetToast] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAnimalDetail(animalId), fetchSensorHistory(animalId)]).then(([aData, hData]) => {
      setAnimal(aData);
      setHistory(hData);
      setLoading(false);
    });
  }, [animalId]);

  if (loading || !animal) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading animal intelligence for {animalId}...
      </div>
    );
  }

  const pred = animal.latest_prediction;
  const riskLevel = pred?.risk_level || 'NO RISK';
  const prob = pred?.risk_probability || 0.0;
  const trend = pred?.risk_trend || 'STABLE';
  const confidence = pred?.data_confidence || 'HIGH';

  const TrendIcon = trend === 'RISING' ? TrendingUp : trend === 'DECLINING' ? TrendingDown : Minus;
  const trendColor = trend === 'RISING' ? 'text-rose-400' : trend === 'DECLINING' ? 'text-emerald-400' : 'text-slate-400';

  // Format data confidence for farmers
  const confidenceDesc =
    confidence === 'HIGH'
      ? t.enoughRecentData
      : confidence === 'MEDIUM'
      ? t.someRecentData
      : confidence === 'LOW'
      ? t.limitedRecentHistory
      : t.notEnoughData;

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Cows</span>
        </button>

        <div className="flex items-center gap-2">
          {animalId === 'COW-027' && (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/30">
              {t.demoScenario} • COW-027
            </span>
          )}
          <button
            onClick={() => onOpenVerification(animalId)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition-all min-h-[44px]"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{t.logCMT}</span>
          </button>
        </div>
      </div>

      {/* 1. Animal Information Card */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">{animal.animal_id}</h1>
              <span className="px-2.5 py-0.5 rounded bg-[#222] text-slate-300 text-xs font-semibold border border-[#333]">
                {animal.breed}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Farm ID: {animal.farm_id} • Status: {animal.status}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-xs">
            <div className="p-2 rounded-xl bg-[#202020] border border-[#2e2e2e] text-center">
              <span className="text-slate-400 block text-[10px]">Parity</span>
              <span className="text-xs font-bold text-white">Parity {animal.parity}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#202020] border border-[#2e2e2e] text-center">
              <span className="text-slate-400 block text-[10px]">Days In Milk</span>
              <span className="text-xs font-bold text-white">{animal.days_in_milk} Days</span>
            </div>
            <div className="p-2 rounded-xl bg-[#202020] border border-[#2e2e2e] text-center">
              <span className="text-slate-400 block text-[10px]">Past Mastitis</span>
              <span className="text-xs font-bold text-white">{animal.previous_mastitis_count} Episodes</span>
            </div>
          </div>
        </div>

        {/* 2. Future Risk Card */}
        <div className="p-5 rounded-xl bg-[#202020] border border-[#2e2e2e] flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <RiskGauge probability={prob} riskLevel={riskLevel} size="lg" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.futureMastitisRisk}</span>
              <h2 className="text-xl font-bold text-white">{riskLevel}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 pt-0.5">
                <span>Forecast Horizon: <strong className="text-white">7–14 Days</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  Trend: <strong className={`font-bold ${trendColor}`}>{trend}</strong>
                  <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                </span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 max-w-xs space-y-0.5">
            <span className="block font-semibold text-slate-300">Prototype Forecast</span>
            <p className="text-[11px]">Based on synthetic demonstration data. Not a clinically validated diagnosis.</p>
          </div>
        </div>
      </div>

      {/* 3. Risk Trajectory Chart */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">30-Day Sensor Trajectory</h3>
          </div>
          <span className="text-[10px] text-slate-400">Electrical Conductivity & Milk Yield</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="reading_date" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#f43f5e" tick={{ fontSize: 10 }} domain={[4, 8]} />
              <YAxis yAxisId="right" orientation="right" stroke="#40c0c0" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#181818', borderColor: '#333', borderRadius: '8px', fontSize: '11px' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="electrical_conductivity" name="Conductivity (mS/cm)" stroke="#f43f5e" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="milk_yield_kg" name="Milk Yield (kg/day)" stroke="#40c0c0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. What Changed? (Farmer Baseline Shifts) */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{t.whatChanged}</span>
        </h3>
        <p className="text-xs text-slate-400">
          Comparison of recent daily readings against this animal's own 14-day historical baseline.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e]">
            <span className="text-[10px] text-slate-400 block">Milk Conductivity</span>
            <span className="text-sm font-bold text-rose-400 mt-0.5 block">
              {animalId === 'COW-027' ? '↑ 18.4% Above Baseline' : 'Baseline Normal'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e]">
            <span className="text-[10px] text-slate-400 block">Milk Yield</span>
            <span className="text-sm font-bold text-amber-400 mt-0.5 block">
              {animalId === 'COW-027' ? '↓ 24.2% Below Baseline' : 'Baseline Normal'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e]">
            <span className="text-[10px] text-slate-400 block">Rumination Time</span>
            <span className="text-sm font-bold text-amber-400 mt-0.5 block">
              {animalId === 'COW-027' ? '↓ Below Baseline' : 'Baseline Normal'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e]">
            <span className="text-[10px] text-slate-400 block">Activity Level</span>
            <span className="text-sm font-bold text-teal-400 mt-0.5 block">
              {animalId === 'COW-027' ? '↓ Below Baseline' : 'Baseline Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Recommended Action & Data Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recommended Verification */}
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.recommendedAction}</h3>
          </div>

          <p className="text-xs font-bold text-white bg-[#202020] p-3 rounded-xl border border-[#2e2e2e]">
            CMT / SCC / Veterinary verification
          </p>

          <p className="text-xs text-slate-300 leading-relaxed">
            {pred?.recommendation || 'Perform routine California Mastitis Test (CMT) verification on all quarters.'}
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => onOpenVerification(animalId)}
              className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition-all flex items-center justify-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>RECORD VERIFICATION</span>
            </button>

            <button
              onClick={() => {
                setShowVetToast(true);
                setTimeout(() => setShowVetToast(false), 4000);
              }}
              className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-[#202020] text-slate-200 font-bold text-xs hover:bg-[#282828] transition-all border border-[#2e2e2e] flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Contact Veterinarian</span>
            </button>

            {showVetToast && (
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 text-center animate-pulse">
                Veterinarian contact workflow will be connected during field deployment.
              </div>
            )}
          </div>
        </div>

        {/* Data Confidence Card */}
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-400 mb-2">
              <Database className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.dataConfidence}</h3>
            </div>

            <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Confidence Rating</span>
                <span className="text-xs font-extrabold text-teal-400">{confidence}</span>
              </div>
              <p className="text-xs font-bold text-slate-200">{confidenceDesc}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e] text-[10px] text-slate-400">
            <strong className="text-slate-300">Independent Rating:</strong> Risk level and data confidence are calculated separately. A high risk forecast can exist even with limited recent history.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;
