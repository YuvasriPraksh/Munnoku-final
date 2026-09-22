import React from 'react';
import { useAuth } from '../context/AuthContext';

type BottomNavBarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const navItems = [
  { name: 'Home', tab: 'home', icon: '🏠' },
  { name: 'Animals', tab: 'animals', icon: '🐄' },
  { name: 'Alerts', tab: 'alerts', icon: '🔔' },
  { name: 'Profile', tab: 'profile', icon: '👤' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.role !== 'FARMER') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-md border-t border-[#242424] flex justify-around items-center py-2 z-50">
      {navItems.map((item) => {
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center justify-center flex-1 min-h-[44px] px-2 text-xs font-semibold transition-all ${
              isActive ? 'text-teal-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-lg leading-none mb-0.5">{item.icon}</span>
            <span className="text-[11px] tracking-tight">{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;


