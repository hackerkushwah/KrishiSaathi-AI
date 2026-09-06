import React from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  User, 
  MapPin, 
  Sprout, 
  Layers, 
  Ruler, 
  Activity, 
  Database, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Edit3,
  ShieldCheck,
  Zap,
  Globe,
  LogIn,
  LogOut,
  Cloud,
  Check
} from 'lucide-react';

export const ProfileView: React.FC = () => {
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
    showToast 
  } = useFarm();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-2xl shadow-2xs border border-emerald-200 overflow-hidden shrink-0">
            {firebaseUser?.photoURL ? (
              <img 
                src={firebaseUser.photoURL} 
                alt={profile?.name || 'User'} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              profile?.name?.charAt(0) || 'K'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                {profile?.name || 'Farmer Profile'}
              </h2>
              {firebaseUser && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  <Check className="w-3 h-3 text-blue-600" />
                  <span>Google Account</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {firebaseUser?.email || profile?.email || 'farmer@krishisaathi.in'} {profile?.phone ? `• ${profile.phone}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('edit_farm')}</span>
          </button>

          {firebaseUser ? (
            <button
              onClick={signOutAuth}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-2xs transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout')}</span>
            </button>
          ) : (
            <button
              onClick={signInWithGoogleAuth}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs transition-all flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
                />
                <path
                  fill="#ffffff"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.26 21.36 7.35 24 12 24z"
                />
              </svg>
              <span>{t('sign_in_google')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Google Authentication & Cloud Sync Banner */}
      <div className={`rounded-3xl p-6 border shadow-2xs transition-all ${
        firebaseUser 
          ? 'bg-blue-50/50 border-blue-200 text-slate-800' 
          : 'bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-emerald-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Cloud className={`w-5 h-5 ${firebaseUser ? 'text-blue-600' : 'text-emerald-600'}`} />
              <h3 className="font-bold text-sm text-slate-900">
                {firebaseUser ? 'Google Cloud Sync Active (Firestore)' : 'Save Farm Records with Google Sign-In'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {firebaseUser 
                ? `Logged in as ${firebaseUser.displayName || firebaseUser.email}. All your farm parameters, disease scans, and AI advisories are automatically persisted to Google Cloud Firestore with real-time sync.`
                : 'Sign in with your Google account to automatically store and restore your farm profile, crop health scans, and personalized crop advisories across any device or browser.'}
            </p>
          </div>

          <div className="shrink-0">
            {firebaseUser ? (
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-blue-200 text-xs font-semibold text-blue-800 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cloud Connected</span>
              </div>
            ) : (
              <button
                id="btn-profile-google-login"
                onClick={signInWithGoogleAuth}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs hover:shadow-sm transition-all"
              >
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
                <span>{t('sign_in_google')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2-COLUMN GRID: FARM PROFILE & TECHNICAL ARCHITECTURE      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Farm Parameters Card */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Active Farm Configuration</span>
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              Field ID: {farm?.id || 'farm-01'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                {t('farmer_name')}
              </span>
              <span className="font-bold text-slate-800">{profile?.name}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {t('farm_location')}
              </span>
              <span className="font-bold text-slate-800">
                {farm?.district}, {farm?.state}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-600" />
                {t('farm_size')}
              </span>
              <span className="font-bold text-slate-800">
                {farm?.acres} {t('acres')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                {t('primary_crop')}
              </span>
              <span className="font-bold text-slate-800">
                {farm?.crop_name} ({farm?.crop_variety || 'High Yield'})
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                {t('soil_type')}
              </span>
              <span className="font-bold text-slate-800">
                {t(`soil_${farm?.soil_type || 'black'}` as any)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                {t('growth_stage')}
              </span>
              <span className="font-bold text-slate-800">
                {t(`stage_${farm?.growth_stage || 'vegetative'}` as any)}
              </span>
            </div>
          </div>
        </div>

        {/* System & Architecture Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Cloud & Database Architecture</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                All Systems Operational
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    <span>Firebase Firestore Database</span>
                  </span>
                  <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connected & Rules Deployed</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Secured with role validation rules for users, farms, advisories, and scans.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Google Identity Services (Auth)</span>
                  </span>
                  <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{firebaseUser ? 'Signed In' : 'Ready'}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Firebase Authentication with GoogleAuthProvider popup sign-in.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Gemini 2.5 Flash Server-Side AI</span>
                  </span>
                  <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Handles agronomic recommendations, query synthesis, and plant disease image diagnostics.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Farm Configuration Action */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              id="btn-reconfigure-farm"
              onClick={() => setShowOnboarding(true)}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>Update Farm & Field Settings</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Update crop variety, acreage, soil classification, or district location anytime.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
