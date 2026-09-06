import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Sparkles, Sprout, Languages, RotateCcw, PlusCircle, LogIn, LogOut, Cloud, Check } from 'lucide-react';

export const TopHeader: React.FC = () => {
  const { 
    farm, 
    profile, 
    firebaseUser, 
    signInWithGoogleAuth, 
    signOutAuth, 
    t, 
    language, 
    setLanguage, 
    setShowOnboarding,
    setActiveTab 
  } = useFarm();

  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting_morning');
    if (hour < 17) return t('greeting_afternoon');
    return t('greeting_evening');
  };

  const displayName = profile?.name ? profile.name.split(' ')[0] : 'Farmer';

  return (
    <header 
      id="app-top-header" 
      className="w-full bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-20 px-4 md:px-8 py-4 flex items-center justify-between transition-all"
    >
      {/* Left: Greeting & Field Badges */}
      <div className="flex items-center gap-3">
        <div className="md:hidden w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
          K
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {displayName}</span>
          </h1>
          <div className="flex flex-wrap gap-2 mt-1.5 items-center">
            <span className="text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
              {farm?.crop_name || 'Crop'}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">
              {farm?.acres || 2} {t('acres')}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md">
              {farm?.district || 'District'}, {farm?.state ? (farm.state.length > 8 ? farm.state.slice(0, 8) : farm.state) : 'State'}
            </span>

            {firebaseUser ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                <Cloud className="w-3 h-3 text-blue-600" />
                <span>Firestore Synced</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Google Sign-In Button (When not logged in) */}
        {!firebaseUser ? (
          <button
            id="btn-google-sign-in"
            onClick={() => setActiveTab('signin')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Open Google Sign-In Page"
          >
            {/* Official Google G SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.22 0 10.06 0 12s.46 3.78 1.26 5.39l4.01-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.26 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            <span className="hidden sm:inline">{t('sign_in_google')}</span>
            <span className="sm:hidden">Sign In</span>
          </button>
        ) : null}

        {/* Onboarding / Configure Farm button */}
        <button
          id="btn-create-farm"
          onClick={() => setShowOnboarding(true)}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          title="Configure farm or run onboarding"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Configure Farm</span>
          <span className="sm:hidden">Setup</span>
        </button>

        {/* Language switch button */}
        <button
          id="btn-header-language"
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all shadow-2xs"
        >
          <Languages className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>

        {/* Profile Avatar with dropdown */}
        <div className="relative">
          <button
            id="btn-user-avatar"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center text-emerald-800 font-bold text-xs md:text-sm shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all"
            title={profile?.name || 'Farmer Profile'}
          >
            {firebaseUser?.photoURL ? (
              <img 
                src={firebaseUser.photoURL} 
                alt={profile?.name || 'User'} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : profile?.name ? (
              profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
            ) : (
              'KS'
            )}
          </button>

          {/* User popup dropdown menu */}
          {showUserDropdown && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 px-4 z-50 text-xs animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <div className="border-b border-slate-100 pb-3 mb-2">
                <p className="font-bold text-slate-800 text-sm">{profile?.name || 'Farmer'}</p>
                <p className="text-slate-500 text-[11px] truncate">{firebaseUser?.email || profile?.email || 'Local Farm Session'}</p>
                {firebaseUser ? (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Google Account Linked</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-lg">
                    <span>Local Guest Session</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('signin');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-2 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <span>Google Cloud Account</span>
                  <Cloud className="w-3.5 h-3.5 text-blue-600" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-2 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Farm Profile
                </button>

                {!firebaseUser ? (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setActiveTab('signin');
                    }}
                    className="w-full text-left px-2 py-2 rounded-lg font-bold text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      signOutAuth();
                    }}
                    className="w-full text-left px-2 py-2 rounded-lg font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

