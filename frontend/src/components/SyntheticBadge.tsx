import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SyntheticBadge: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
      <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-amber-400" />
      <span>{t.syntheticNotice}</span>
    </div>
  );
};
