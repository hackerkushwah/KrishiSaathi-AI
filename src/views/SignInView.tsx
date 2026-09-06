import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  LogIn, 
  LogOut, 
  Cloud, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Sprout, 
  Database, 
  FileText, 
  ScanLine, 
  ArrowRight,
  ArrowLeft,
  User,
  ExternalLink,
  Check,
  Lock,
  Globe
} from 'lucide-react';

interface SignInViewProps {
  onBackToLanding?: () => void;
  onEnterApp?: () => void;
}

export const SignInView: React.FC<SignInViewProps> = ({ onBackToLanding, onEnterApp }) => {
  const { 
    firebaseUser, 
    isAuthLoading, 
    signInWithGoogleAuth, 
    signOutAuth, 
    profile, 
    farm, 
    advisories, 
    scans, 
    t, 
    setActiveTab,
    loginDemoUser,
    showToast,
    language
  } = useFarm();

  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogleAuth();
      if (onEnterApp) {
        onEnterApp();
      } else {
        setActiveTab('home');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDemoAccess = async () => {
    try {
      await loginDemoUser();
      if (onEnterApp) {
        onEnterApp();
      } else {
        setActiveTab('home');
      }
    } catch (err) {
      showToast('Failed to enter demo mode', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAuth();
      showToast('Signed out successfully', 'info');
      if (onBackToLanding) onBackToLanding();
    } catch (err) {
      showToast('Failed to sign out', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-200">
      
      {/* Back to Landing Page Link */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-landing"
          onClick={() => {
            if (onBackToLanding) {
              onBackToLanding();
            } else {
              setActiveTab('landing');
            }
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? '← मुख्य पृष्ठ (Landing Page)' : '← Back to Landing Page'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Google Identity Services</span>
        </div>
      </div>

      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-3xl p-6 md:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 border border-emerald-700 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Essential Authentication Gate • आवश्यक सत्यापन</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {firebaseUser ? 'Farmer Cloud Account Connected' : 'Sign in with Google / किसान लॉगिन'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl leading-relaxed">
            {firebaseUser
              ? 'Your farm parameters, diagnostic leaf scans, and agronomic advisories are actively synced in real time to your private Google Firestore database.'
              : 'Google Sign-In is required to initialize your encrypted Firestore cloud database, safeguard your farm parcel coordinates, and store historical crop treatments.'}
          </p>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Primary Auth Box */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-2xs space-y-6">
          {firebaseUser ? (
            /* Signed In State */
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'Farmer'}
                    className="w-16 h-16 rounded-full border-2 border-emerald-300 object-cover shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center">
                    {firebaseUser.displayName?.[0] || 'F'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base text-slate-800 truncate">
                      {firebaseUser.displayName || 'Farmer User'}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{firebaseUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    UID: {firebaseUser.uid.slice(0, 10)}…
                  </span>
                </div>
              </div>

              {/* Sync statistics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Farm</span>
                  <span className="text-sm font-bold text-slate-800 block truncate">
                    {farm?.crop_name || 'Soybean'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">{farm?.acres || 2} Acres</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved Advisories</span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {advisories.length}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium">Cloud Synced</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Leaf Scans</span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {scans.length}
                  </span>
                  <span className="text-[10px] text-purple-600 font-medium">Archived</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  id="btn-enter-app-from-signin"
                  onClick={() => {
                    if (onEnterApp) {
                      onEnterApp();
                    } else {
                      setActiveTab('home');
                    }
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enter Web Application / मुख्य ऐप खोलें</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-signout"
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Google Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated State */
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-800">
                  {language === 'hi' ? 'गूगल से लॉगिन करें' : 'Sign in to Access KrishiSaathi AI'}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'hi' 
                    ? 'कृपया अपने गूगल खाते से लॉगिन करें। इससे आपका खेत, पत्तों के रोग स्कैन और उपग्रह मानचित्र का डेटा सुरक्षित रहेगा।'
                    : 'To access the Web Application, authenticate with Google. Your farm records will be permanently saved to your private Google Cloud database.'}
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <button
                id="btn-google-auth"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || isAuthLoading}
                className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-emerald-500 shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
                <span>{isSigningIn || isAuthLoading ? 'Authenticating with Google…' : 'Sign in with Google / गूगल से लॉगिन करें'}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Or Test Without Sign-In
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Guest / Demo Option */}
              <button
                id="btn-guest-mode"
                onClick={handleDemoAccess}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue as Demo Farmer (Ramesh Patel • Malwa Farm)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Key Benefits & Security info */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>Why Google Sign-In is Essential</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-semibold block">Durable Farm Persistence</strong>
                  Your acreage, soil test parameters, and growth stages are stored in Firestore, accessible from mobile or desktop.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-semibold block">Diagnostic Leaf Scan History</strong>
                  Keep an organized log of all disease scans and remediation steps taken throughout the crop season.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-semibold block">Tailored AI Guidance</strong>
                  AI Saathi remembers prior questions and weather advisories to prevent duplicate sprays and reduce input costs.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-semibold block">Private & Isolated Data</strong>
                  Role-based security rules guarantee that your farm data can only be queried by your verified Google identity.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-medium">Firestore DB: Active</span>
            </div>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
              ai-studio-krishisaathiai
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
