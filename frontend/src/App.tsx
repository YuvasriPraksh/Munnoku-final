import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { BottomNavBar } from './components/BottomNavBar';
import { FarmerHome } from './pages/FarmerHome';
import { AnimalListPage } from './pages/AnimalListPage';
import { AnimalDetail } from './pages/AnimalDetail';
import { AlertsPage } from './pages/AlertsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HerdIntelligence } from './pages/HerdIntelligence';
import { VerificationPage } from './pages/VerificationPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { AccessRestricted } from './pages/AccessRestricted';
import { VeterinarianPlaceholder } from './pages/VeterinarianPlaceholder';
import { FieldStaffPlaceholder } from './pages/FieldStaffPlaceholder';
import { AdminPlaceholder } from './pages/AdminPlaceholder';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { UserRole } from './types';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [verificationAnimalId, setVerificationAnimalId] = useState<string>('COW-027');
  const { currentUser, isAuthenticated } = useAuth();
  if (!isAuthenticated || !currentUser) {
    return <RoleSelectionPage />;
  }
  const role = currentUser.role as UserRole;
  const isAuthorized = (allowed: UserRole[]) => allowed.includes(role);

  const handleSelectAnimal = (animalId: string) => {
    setSelectedAnimalId(animalId);
    setActiveTab('animalDetail');
  };

  const handleOpenVerification = (animalId: string) => {
    setVerificationAnimalId(animalId);
    setActiveTab('verification');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={(tab) => {
        if (tab !== 'animalDetail') setSelectedAnimalId(null);
        setActiveTab(tab);
      }} />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <FarmerHome onSelectAnimal={handleSelectAnimal} />
        )}

        {activeTab === 'animals' && (
          <AnimalListPage onSelectAnimal={handleSelectAnimal} />
        )}

        {activeTab === 'animalDetail' && selectedAnimalId && (
          <AnimalDetail
            animalId={selectedAnimalId}
            onBack={() => setActiveTab('animals')}
            onOpenVerification={handleOpenVerification}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsPage onSelectAnimal={handleSelectAnimal} />
        )}

        {activeTab === 'profile' && (
          <ProfilePage />
        )}

        {activeTab === 'herd' && (
          <HerdIntelligence onSelectAnimal={handleSelectAnimal} />
        )}

        {activeTab === 'verification' && (
          <VerificationPage initialAnimalId={verificationAnimalId} />
        )}

        {activeTab === 'modelInfo' && (
          <ModelInfoPage />
        )}
        {/* Role-specific dashboards */}
        {activeTab === 'veterinarian' && isAuthorized(['VETERINARIAN']) && (
          <VeterinarianPlaceholder onSelectAnimal={handleSelectAnimal} />
        )}
        {activeTab === 'veterinarian' && !isAuthorized(['VETERINARIAN']) && (
          <AccessRestricted />
        )}

        {activeTab === 'fieldstaff' && isAuthorized(['FIELD_STAFF']) && (
          <FieldStaffPlaceholder />
        )}
        {activeTab === 'fieldstaff' && !isAuthorized(['FIELD_STAFF']) && (
          <AccessRestricted />
        )}

        {activeTab === 'admin' && isAuthorized(['ADMIN']) && (
          <AdminPlaceholder />
        )}
        {activeTab === 'admin' && !isAuthorized(['ADMIN']) && (
          <AccessRestricted />
        )}
      </main>

      {/* Bottom Navigation for Mobile Farmers */}
      <BottomNavBar activeTab={activeTab} setActiveTab={(tab) => {
        if (tab !== 'animalDetail') setSelectedAnimalId(null);
        setActiveTab(tab);
      }} />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="font-bold text-slate-200">MUNNOKKU</span> • AI-Based Early Risk Forecasting
          </div>
          <div className="flex items-center gap-3">
            <span>Decision Support System</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
