import React from 'react';
import { useFarm, NavigationTab } from '../context/FarmContext';
import { 
  Home, 
  Bot, 
  ScanLine, 
  Activity, 
  FileText, 
  User, 
  Sprout, 
  Languages,
  Sparkles,
  Wifi,
  WifiOff,
  Globe,
  LogIn
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, t, farm, profile, language, setLanguage, isOnline, advisories, firebaseUser } = useFarm();

  const navItems: { id: NavigationTab; labelKey: string; icon: React.ComponentType<any>; badge?: number }[] = [
    { id: 'home', labelKey: 'nav_home', icon: Home },
    { id: 'ai_saathi', labelKey: 'nav_ai_saathi', icon: Bot },
    { id: 'scanner', labelKey: 'nav_scanner', icon: ScanLine },
    { id: 'satellite', labelKey: 'nav_satellite', icon: Globe },
    { id: 'intelligence', labelKey: 'nav_intelligence', icon: Activity },
    { id: 'advisories', labelKey: 'nav_advisories', icon: FileText, badge: advisories.length },
    { id: 'profile', labelKey: 'nav_profile', icon: User },
    { id: 'signin', labelKey: 'nav_signin', icon: LogIn },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR NAVIGATION                                */}
      {/* ========================================================= */}
      <aside 
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 bg-white border-r border-emerald-100 shrink-0 h-screen sticky top-0 z-30"
      >
        {/* Brand Header */}
        <div className="p-6 pb-4">
          <button
            id="btn-sidebar-logo-landing"
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2 mb-4 text-left cursor-pointer hover:opacity-85 transition-opacity"
            title="Go to KrishiSaathi Landing Page"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
              K
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-900 uppercase">
              KrishiSaathi <span className="text-emerald-500 underline decoration-2">AI</span>
            </span>
          </button>
          <p className="text-xs text-slate-500 font-medium">
            {t('app_tagline')}
          </p>
        </div>

        {/* Farmer & Field Quick Context Pill */}
        <div className="px-4 py-3 bg-emerald-50/60 mx-4 mb-3 rounded-2xl border border-emerald-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[125px]">
                {profile?.name || 'Ramesh Patel'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-100 shadow-2xs">
              {farm?.acres || 2} {t('acres')}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 truncate">
            {farm?.crop_name || 'Soybean'} • {farm?.district || 'Indore'}
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{t(item.labelKey)}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions: Selected Language & Connectivity */}
        <div className="mt-auto p-4 border-t border-emerald-100/80 space-y-3">
          {/* Selected Language Card matching Design HTML */}
          <div 
            id="desktop-lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="bg-emerald-900 rounded-2xl p-4 text-white cursor-pointer hover:bg-emerald-950 transition-colors shadow-sm"
          >
            <p className="text-[10px] font-medium opacity-70 mb-1 uppercase tracking-wider">
              {language === 'en' ? 'Selected Language' : 'चुनी गई भाषा'}
            </p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">
                {language === 'en' ? 'हिन्दी | English' : 'English | हिन्दी'}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Network indicator */}
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-slate-500">{isOnline ? 'System Live' : 'Offline Cache'}</span>
            </div>
            <span className="text-[10px] text-slate-400">Gemini 3.8</span>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR                              */}
      {/* ========================================================= */}
      <nav 
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-emerald-100 px-2 py-1 z-40 flex items-center overflow-x-auto no-scrollbar gap-1 shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all shrink-0 min-w-[58px] min-h-[44px] relative ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? 'bg-emerald-50' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-emerald-600 stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 whitespace-nowrap leading-none">
                {t(item.labelKey)}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-0.5 right-2 w-3.5 h-3.5 bg-emerald-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
