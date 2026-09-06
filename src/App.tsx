/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Navigation } from './components/Navigation';
import { TopHeader } from './components/TopHeader';
import { ToastContainer } from './components/ToastContainer';
import { OnboardingModal } from './components/OnboardingModal';
import { LandingView } from './views/LandingView';
import { SignInView } from './views/SignInView';
import { DashboardView } from './views/DashboardView';
import { AiSaathiView } from './views/AiSaathiView';
import { DiseaseScannerView } from './views/DiseaseScannerView';
import { FarmIntelligenceView } from './views/FarmIntelligenceView';
import { AdvisoriesView } from './views/AdvisoriesView';
import { ProfileView } from './views/ProfileView';
import { SatelliteMapView } from './views/SatelliteMapView';
import { Sprout } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, showOnboarding, setShowOnboarding, isLoading } = useFarm();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md animate-bounce">
          <Sprout className="w-8 h-8 text-emerald-200" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            KrishiSaathi AI
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Synchronizing farm intelligence &amp; local weather models…
          </p>
        </div>
      </div>
    );
  }

  // 1. First: Dedicated Landing Page
  if (activeTab === 'landing') {
    return (
      <>
        <LandingView onGoToSignIn={() => setActiveTab('signin')} />
        <ToastContainer />
      </>
    );
  }

  // 2. Second: Dedicated Sign-In / Login Page
  if (activeTab === 'signin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
        <SignInView 
          onBackToLanding={() => setActiveTab('landing')} 
          onEnterApp={() => setActiveTab('home')} 
        />
        <ToastContainer />
      </div>
    );
  }

  // 3. Third: Authenticated Web Application Views
  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardView />;
      case 'ai_saathi':
        return <AiSaathiView />;
      case 'scanner':
        return <DiseaseScannerView />;
      case 'satellite':
        return <SatelliteMapView />;
      case 'intelligence':
        return <FarmIntelligenceView />;
      case 'advisories':
        return <AdvisoriesView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF5] text-slate-900 flex font-sans">
      {/* Sidebar Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <TopHeader />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Progressive Onboarding Flow Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Notifications & Micro-Interactions */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <FarmProvider>
      <AppContent />
    </FarmProvider>
  );
}
