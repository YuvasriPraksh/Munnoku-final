import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { ShieldCheck, Stethoscope, ClipboardList, Building2, UserCheck, ArrowRight } from 'lucide-react';

export const RoleSelectionPage: React.FC = () => {
  const { selectRole } = useAuth();

  const roleCards: Array<{
    role: UserRole;
    title: string;
    icon: React.ElementType;
    description: string;
    demoUser: string;
    farm: string;
    badgeColor: string;
    btnColor: string;
  }> = [
    {
      role: 'FARMER',
      title: 'Farmer',
      icon: ShieldCheck,
      description: 'Simple animal health monitoring and daily check alerts.',
      demoUser: 'Demo Farmer',
      farm: 'FARM-01',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      btnColor: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/40'
    },
    {
      role: 'VETERINARIAN',
      title: 'Veterinarian',
      icon: Stethoscope,
      description: 'Clinical and AI-assisted animal intelligence, SHAP factors & CMT history.',
      demoUser: 'Demo Veterinarian',
      farm: 'FARM-01',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      btnColor: 'bg-sky-600 text-white hover:bg-sky-500 shadow-sky-900/40'
    },
    {
      role: 'FIELD_STAFF',
      title: 'Field Staff',
      icon: ClipboardList,
      description: 'Farm data collection, milk yield, conductivity & observation logging.',
      demoUser: 'Demo Field Staff',
      farm: 'FARM-01',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      btnColor: 'bg-amber-600 text-slate-950 hover:bg-amber-500 shadow-amber-900/40 font-bold'
    },
    {
      role: 'ADMIN',
      title: 'Farm Admin',
      icon: Building2,
      description: 'Herd-level intelligence, multi-farm analytics & verification statistics.',
      demoUser: 'Demo Admin',
      farm: 'ALL FARMS',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      btnColor: 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-900/40'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">MUNNOKKU</span>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-3xl mx-auto w-full text-center space-y-3 py-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          MUNNOKKU
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          AI-powered early mastitis risk forecasting for Indian dairy farms. Select a demo role account to explore tailored interfaces.
        </p>
      </div>

      {/* 4 Role Selection Cards Grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-8">
        {roleCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.role}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl border ${card.badgeColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    DEMO ACCOUNT
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">{card.title}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{card.description}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    {card.demoUser}
                  </span>
                  <span className="font-semibold text-slate-400">{card.farm}</span>
                </div>

                <button
                  onClick={() => selectRole(card.role)}
                  className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 group-hover:translate-x-0.5 ${card.btnColor}`}
                >
                  <span>Continue as {card.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-5xl mx-auto w-full text-center pb-4 text-xs text-slate-400 border-t border-slate-900 pt-4">
        <span>Role-Based Access Control. Select an account role to explore tailored interfaces.</span>
      </div>
    </div>
  );
};
