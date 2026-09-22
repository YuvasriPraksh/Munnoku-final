import React from 'react';
import { Lock, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccessRestrictedProps {
  attemptedRole?: string;
  onReturnHome?: () => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  attemptedRole = 'restricted page',
  onReturnHome = () => {}
}) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-2xl">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Access restricted for this role</h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Your active account <strong className="text-white font-bold">{currentUser?.name}</strong> ({currentUser?.role}) does not have permission to access the <strong className="text-rose-400 font-bold">{attemptedRole}</strong> interface.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 max-w-md mx-auto">
        <ShieldAlert className="w-4 h-4 text-amber-400 mx-auto mb-1" />
        <span>Role-Based Access Control (RBAC) foundation is active. Unauthorized views are hidden to prevent accidental role confusion.</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onReturnHome}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 hover:text-white transition-all min-h-[44px] flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <button
          onClick={logout}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-lg min-h-[44px] flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Switch Demo Role Account</span>
        </button>
      </div>
    </div>
  );
};
