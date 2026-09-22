import React from 'react';
import { SyntheticBadge } from '../components/SyntheticBadge';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const ModelInfoPage: React.FC = () => {
  const modelMetrics = [
    { name: 'Logistic Regression', type: 'Linear Baseline', acc: '96.37%', prec: '23.21%', rec: '68.42%', f1: '0.3467', prauc: '0.1500', roc: '0.9276', best: false },
    { name: 'Random Forest', type: 'Ensemble Trees', acc: '99.41%', prec: '92.31%', rec: '63.16%', f1: '0.7500', prauc: '0.7207', roc: '0.9052', best: true },
    { name: 'XGBoost', type: 'Gradient Boosting', acc: '98.74%', prec: '54.17%', rec: '68.42%', f1: '0.6047', prauc: '0.6708', roc: '0.8826', best: false },
    { name: 'LightGBM', type: 'Gradient Boosting', acc: '98.96%', prec: '61.90%', rec: '68.42%', f1: '0.6500', prauc: '0.6627', roc: '0.9225', best: false },
  ];

  const pipelineSteps = [
    { name: 'Data Ingestion', desc: 'Longitudinal Sensor Telemetry' },
    { name: 'Individual Baseline', desc: '14-Day Cow Rolling Normal' },
    { name: 'Temporal Features', desc: 'Rolling Stats & Convergence' },
    { name: 'Random Forest ML', desc: 'Chronological Test Split' },
    { name: 'SHAP Explainability', desc: 'TreeExplainer Contributions' },
    { name: 'Future Risk Forecast', desc: '7–14 Day Early Window' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <span>Model Intelligence & Technical Benchmarks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Technical architecture and empirical benchmark evaluation for SIH judges.
          </p>
        </div>
        <SyntheticBadge />
      </div>

      {/* Pipeline Diagram for SIH Judges */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          <span>System Pipeline Flow</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {pipelineSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800 flex flex-col justify-between text-center relative">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider mb-1">Step {idx + 1}</span>
                <span className="text-xs font-black text-white block">{step.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Model Benchmark Evaluation (SYNTHETIC-DATA EVALUATION)</span>
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Selected: Random Forest
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">Model</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Precision</th>
                <th className="p-3">Recall</th>
                <th className="p-3">F1-Score</th>
                <th className="p-3">PR-AUC</th>
                <th className="p-3">ROC-AUC</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {modelMetrics.map((m, idx) => (
                <tr key={idx} className={m.best ? 'bg-emerald-950/20 font-bold text-white' : 'hover:bg-slate-800/40'}>
                  <td className="p-3 flex items-center gap-2">
                    {m.name}
                    {m.best && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </td>
                  <td className="p-3">{m.acc}</td>
                  <td className="p-3">{m.prec}</td>
                  <td className="p-3">{m.rec}</td>
                  <td className="p-3 font-extrabold text-emerald-400">{m.f1}</td>
                  <td className="p-3">{m.prauc}</td>
                  <td className="p-3">{m.roc}</td>
                  <td className="p-3 text-right">
                    {m.best ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Selected</span>
                    ) : (
                      <span className="text-slate-500">Evaluated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400">
          <strong className="text-slate-300">SIH Feasibility Statement:</strong> These results demonstrate prototype technical feasibility on synthetic demonstration data and are not clinical validation.
        </div>
      </div>

      {/* Lead Time & Theoretical Window Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <span>7–14 Day Lead-Time Window Evaluation</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Theoretical lead time evaluated on simulated subclinical physiological parameter shifts. Zero temporal data leakage enforced.
          </p>
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400">Mean Lead Time:</span>
              <span className="font-bold text-white">7.0 Days</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400">Detected ≥ 7 Days Prior:</span>
              <span className="font-bold text-emerald-400">100%</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400">False Alarm Rate:</span>
              <span className="font-bold text-amber-400">35.7% (Test Set Window)</span>
            </div>
          </div>
        </div>

        {/* System Boundaries */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>System Boundaries & Disclaimers</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-white">Synthetic-Data Evaluation:</strong> Evaluated on simulated time-series data. Field clinical validation is future work.
            </li>
            <li>
              <strong className="text-white">Decision Support Only:</strong> Designed to assist management decisions. Does not substitute veterinary clinical diagnosis.
            </li>
            <li>
              <strong className="text-white">Non-Prescriptive:</strong> System recommends CMT/SCC checks only. Excludes antibiotic or medication dosing.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
