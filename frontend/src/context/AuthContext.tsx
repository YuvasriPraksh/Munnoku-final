import React, { createContext, useContext, useState } from 'react';
import type { UserAccount, UserRole } from '../types';

export const DEMO_ACCOUNTS: Record<UserRole, UserAccount> = {
  FARMER: {
    user_id: 'usr_farmer',
    name: 'Demo Farmer',
    email: 'farmer@munnokku.in',
    role: 'FARMER',
    farm_id: 'FARM-01',
    active: true
  },
  VETERINARIAN: {
    user_id: 'usr_vet',
    name: 'Demo Veterinarian',
    email: 'vet@munnokku.in',
    role: 'VETERINARIAN',
    farm_id: 'FARM-01',
    active: true
  },
  FIELD_STAFF: {
    user_id: 'usr_field',
    name: 'Demo Field Staff',
    email: 'field@munnokku.in',
    role: 'FIELD_STAFF',
    farm_id: 'FARM-01',
    active: true
  },
  ADMIN: {
    user_id: 'usr_admin',
    name: 'Demo Admin',
    email: 'admin@munnokku.in',
    role: 'ADMIN',
    farm_id: 'ALL',
    active: true
  }
};

interface AuthContextType {
  currentUser: UserAccount | null;
  selectRole: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('munnokku_user_role');
    if (saved && saved in DEMO_ACCOUNTS) {
      return DEMO_ACCOUNTS[saved as UserRole];
    }
    // Default to FARMER role for immediate demo experience if not logged out
    return DEMO_ACCOUNTS['FARMER'];
  });

  const selectRole = (role: UserRole) => {
    const account = DEMO_ACCOUNTS[role];
    setCurrentUser(account);
    localStorage.setItem('munnokku_user_role', role);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('munnokku_user_role');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        selectRole,
        logout,
        isAuthenticated: currentUser !== null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
