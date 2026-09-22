import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Shield, Home, LogOut, RefreshCw } from 'lucide-react';
import type { UserRole } from '../types';

export const ProfilePage: React.FC = () => {
  const { currentUser, selectRole, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleSwitchRole = () => {
    const roles: UserRole[] = ['FARMER', 'VETERINARIAN', 'FIELD_STAFF', 'ADMIN'];
    const currentIndex = roles.indexOf((currentUser?.role || 'FARMER') as UserRole);
    const nextRole = roles[(currentIndex + 1) % roles.length];
    selectRole(nextRole);
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto pb-24 text-slate-100 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">{t.profile}</h1>
        <span className="text-[10px] px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
          Demo Profile
        </span>
      </div>

      {/* User Information Card */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-4">
        <div className="flex items-center gap-3.5 border-b border-[#262626] pb-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500 text-slate-950 font-black text-lg flex items-center justify-center">
            {currentUser?.name?.charAt(0) || 'F'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{currentUser?.name || 'Demo Farmer'}</h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Farm ID: {currentUser?.farm_id || 'FARM-001'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#202020] border border-[#2e2e2e]">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Active Role:</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
            {currentUser?.role || 'FARMER'}
          </span>
        </div>
      </div>

      {/* Language Preferences Card */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-400" />
          <span>Language Settings</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['en', 'ta', 'hi'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`min-h-[44px] px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center ${
                language === lang
                  ? 'bg-teal-500 text-slate-950 border-teal-400 font-extrabold'
                  : 'bg-[#202020] text-slate-400 border-[#2e2e2e] hover:text-white'
              }`}
            >
              <span>{lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिंदी'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Role Switcher & Logout */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={handleSwitchRole}
          className="w-full min-h-[44px] px-5 py-3 rounded-xl bg-[#202020] text-slate-200 font-bold text-xs hover:bg-[#282828] transition-all border border-[#2e2e2e] flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-teal-400" />
          <span>{t.switchRole} ({currentUser?.role})</span>
        </button>

        <button
          onClick={logout}
          className="w-full min-h-[44px] px-5 py-3 rounded-xl bg-rose-950/40 text-rose-300 font-bold text-xs hover:bg-rose-900/60 transition-all border border-rose-800/60 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;


