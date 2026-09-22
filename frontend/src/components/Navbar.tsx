import React from 'react';
import { Home, Users, Bell, Activity, ClipboardCheck, Info, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'animals', label: t.animals, icon: Users },
    { id: 'alerts', label: t.alerts, icon: Bell },
    { id: 'herd', label: t.herd, icon: Activity },
    { id: 'verification', label: t.verification, icon: ClipboardCheck },
    { id: 'modelInfo', label: t.modelInfo, icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#242424]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">{t.appName}</span>
              </div>
            </div>
          </div>

          {/* Multi-language Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#1e1e1e] p-1 rounded-lg border border-[#333]">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                    language === lang
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'ta' ? 'தமிழ்' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-[#222] overflow-x-auto py-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f1f1f]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

