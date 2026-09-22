import React from 'react';
import { Building2, Activity, MapPin, Database, Sparkles } from 'lucide-react';
import { SyntheticBadge } from '../components/SyntheticBadge';

export const AdminPlaceholder: React.FC = () => {
  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-24 text-slate-100 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" />
              <span>Farm Admin Dashboard</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              🏢 FARM ADMIN ROLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Herd-level intelligence, multi-farm analytics, verification statistics & GIS module placeholder.
          </p>
        </div>
        <SyntheticBadge />
      </div>

      {/* Hero Overview */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold w-fit border border-purple-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 5 RBAC Foundation • Farm Admin Module</span>
        </div>

        <h2 className="text-base font-bold text-white">Multi-Farm & System Intelligence</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Farm Administrators have access to overall herd risk distributions across all associated cooperative farms, verification audit logs, system performance monitoring, and spatial GIS mapping placeholders.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e] text-center">
            <span className="text-[10px] text-slate-400 block">Total Monitored Farms</span>
            <span className="text-base font-bold text-white">3 Farms</span>
          </div>
          <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e] text-center">
            <span className="text-[10px] text-slate-400 block">Total Monitored Animals</span>
            <span className="text-base font-bold text-white">50 Cows</span>
          </div>
          <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e] text-center">
            <span className="text-[10px] text-slate-400 block">Active Model Version</span>
            <span className="text-base font-bold text-teal-400">Random Forest v1.0</span>
          </div>
          <div className="p-3 rounded-xl bg-[#202020] border border-[#2e2e2e] text-center">
            <span className="text-[10px] text-slate-400 block">GIS Module</span>
            <span className="text-base font-bold text-purple-400">Planned</span>
          </div>
        </div>
      </div>

      {/* Farm Risk Map GIS Placeholder */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400">
            <MapPin className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Farm Risk Map (GIS)</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
            GIS integration planned for field deployment
          </span>
        </div>
        <div className="h-32 rounded-xl bg-[#121212] border border-[#262626] flex items-center justify-center text-center p-3">
          <div className="space-y-0.5">
            <MapPin className="w-6 h-6 text-slate-600 mx-auto animate-bounce" />
            <p className="text-xs text-slate-300 font-semibold">Geographic Disease Risk Mapping Matrix</p>
            <p className="text-[10px] text-slate-400">Cooperative Spatial Hotspot Analytics — Field Deployment Ready Architecture</p>
          </div>
        </div>
      </div>

      {/* Modular Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1.5">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-xs font-bold text-white">Herd Risk Analytics</h3>
          <p className="text-xs text-slate-400">
            Cooperative-wide risk distribution and high-priority animal intervention monitoring.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1.5">
          <MapPin className="w-5 h-5 text-teal-400" />
          <h3 className="text-xs font-bold text-white">Future GIS Spatial Module</h3>
          <p className="text-xs text-slate-400">
            Geographic hotspot tracking for subclinical mastitis clusters across dairy cooperatives.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1.5">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-bold text-white">Audit & System Status</h3>
          <p className="text-xs text-slate-400">
            Field verification logs, ground truth feedback, and database sync metrics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPlaceholder;

