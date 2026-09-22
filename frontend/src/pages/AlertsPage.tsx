import React, { useEffect, useState } from 'react';
import type { AlertItem } from '../types';
import { fetchAlerts } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Bell, TrendingUp, ShieldAlert, ChevronRight, CheckCircle2 } from 'lucide-react';

interface AlertsPageProps {
  onSelectAnimal: (animalId: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onSelectAnimal }) => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'RISING' | 'DATA_QUALITY'>('ALL');

  useEffect(() => {
    fetchAlerts().then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (alertFilter === 'HIGH') return alert.risk_level === 'HIGH';
    if (alertFilter === 'MODERATE') return alert.risk_level === 'MODERATE';
    if (alertFilter === 'RISING') return alert.alert_type === 'RISING_RISK' || alert.title.toLowerCase().includes('rising');
    if (alertFilter === 'DATA_QUALITY') return alert.alert_type === 'DATA_QUALITY' || alert.title.toLowerCase().includes('data');
    return true;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-24 text-slate-100 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>Farm Risk Alerts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Actionable 7–14 day early forecasting alerts prioritizing farmer field checks.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-[#1e1e1e] text-slate-300 text-xs font-bold border border-[#333] w-fit">
          {filteredAlerts.length} Active Alerts
        </span>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setAlertFilter('ALL')}
          className={`min-h-[40px] px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            alertFilter === 'ALL' ? 'bg-teal-500 text-slate-950 font-extrabold' : 'bg-[#1e1e1e] text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setAlertFilter('HIGH')}
          className={`min-h-[40px] px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            alertFilter === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-[#1e1e1e] text-rose-400 hover:bg-rose-950/40'
          }`}
        >
          🔴 High Risk
        </button>
        <button
          onClick={() => setAlertFilter('MODERATE')}
          className={`min-h-[40px] px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            alertFilter === 'MODERATE' ? 'bg-amber-600 text-slate-950' : 'bg-[#1e1e1e] text-amber-400 hover:bg-amber-950/40'
          }`}
        >
          🟠 Moderate Risk
        </button>
        <button
          onClick={() => setAlertFilter('RISING')}
          className={`min-h-[40px] px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            alertFilter === 'RISING' ? 'bg-sky-600 text-white' : 'bg-[#1e1e1e] text-sky-400 hover:bg-sky-950/40'
          }`}
        >
          🔵 Rising Risk
        </button>
        <button
          onClick={() => setAlertFilter('DATA_QUALITY')}
          className={`min-h-[40px] px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            alertFilter === 'DATA_QUALITY' ? 'bg-purple-600 text-white' : 'bg-[#1e1e1e] text-purple-400 hover:bg-purple-950/40'
          }`}
        >
          ⚪ Data Quality
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading risk alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="py-16 text-center bg-[#181818] rounded-2xl border border-[#2a2a2a] text-teal-400 text-xs flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-teal-400" />
          <span>No alerts found matching selected criteria!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isHigh = alert.risk_level === 'HIGH';
            const cardBg = isHigh ? 'bg-[#1c1414] border-rose-500/30' : 'bg-[#1c1914] border-amber-500/30';
            const badgeBg = isHigh ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300';

            return (
              <div
                key={alert.alert_id}
                className={`p-4 rounded-xl border ${cardBg} transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${badgeBg} shrink-0 mt-0.5`}>
                    {isHigh ? <ShieldAlert className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${badgeBg}`}>
                        {alert.risk_level} FUTURE RISK
                      </span>
                      <span className="text-[11px] text-slate-400">{alert.created_at}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{alert.animal_id} — {alert.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                    <div className="text-[11px] text-slate-400 pt-0.5">
                      Recommended Verification: <strong className="text-slate-200">CMT / SCC / Veterinary verification</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectAnimal(alert.animal_id)}
                  className={`w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                    isHigh ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-amber-600 text-slate-950 hover:bg-amber-500'
                  }`}
                >
                  <span>{t.checkAnimal} ({alert.animal_id})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;


