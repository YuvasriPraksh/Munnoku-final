import React from 'react';
import { Stethoscope, ShieldCheck, Activity, ClipboardCheck, Sparkles } from 'lucide-react';
import { SyntheticBadge } from '../components/SyntheticBadge';

interface VeterinarianPlaceholderProps {
  onSelectAnimal: (animalId: string) => void;
}

export const VeterinarianPlaceholder: React.FC<VeterinarianPlaceholderProps> = ({ onSelectAnimal }) => {
  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-24 text-slate-100 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-400" />
              <span>Veterinarian Clinical Dashboard</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              🩺 VETERINARIAN ROLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clinical and AI-assisted animal health forecasting, SHAP explainability, and veterinary verification.
          </p>
        </div>
        <SyntheticBadge />
      </div>

      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold w-fit border border-teal-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 5 RBAC Foundation • Veterinarian Module</span>
        </div>

        <h2 className="text-base font-bold text-white">Clinical AI Decision Support</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Veterinarians have full access to SHAP feature contributions, individual rolling baseline deviations, raw somatic cell count (SCC) trends, and California Mastitis Test (CMT) verification logs across all farm animals.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => onSelectAnimal('COW-027')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition-all min-h-[44px] flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Inspect COW-027 Clinical Intelligence</span>
          </button>
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1.5">
          <Activity className="w-5 h-5 text-teal-400" />
          <h3 className="text-xs font-bold text-white">7–14 Day Early Risk Forecast</h3>
          <p className="text-xs text-slate-400">
            Random Forest predictions evaluated on temporal electrical conductivity and yield shifts.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1.5">
          <ClipboardCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-bold text-white">Clinical Verification Logging</h3>
          <p className="text-xs text-slate-400">
            Record CMT scores, SCC cell counts, quarter swelling, and veterinary clinical notes.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1.5">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <h3 className="text-xs font-bold text-white">SHAP Explanations</h3>
          <p className="text-xs text-slate-400">
            TreeExplainer factor contributions detailing top signal variations for clinical review.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VeterinarianPlaceholder;

