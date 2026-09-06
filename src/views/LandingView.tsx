import React from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  Sprout, 
  ScanLine, 
  Globe, 
  MessageSquareText, 
  Cloud, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Sun, 
  TrendingUp, 
  Languages, 
  UserCheck, 
  Lock,
  Compass,
  FileText,
  Activity,
  Layers
} from 'lucide-react';

interface LandingViewProps {
  onGoToSignIn: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGoToSignIn }) => {
  const { language, setLanguage, loginDemoUser, showToast, t } = useFarm();

  const handleDemoAccess = async () => {
    try {
      await loginDemoUser();
      showToast('Welcome Ramesh Patel! Entered in Demo Farmer Mode', 'success');
    } catch (e) {
      showToast('Failed to enter demo mode', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-200">
      
      {/* ========================================================= */}
      {/* TOP LANDING NAVIGATION BAR                               */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  KrishiSaathi
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                स्मार्ट कृषि साथी • Smart AI Agronomist for Indian Farmers
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  language === 'hi' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Demo Quick Button */}
            <button
              id="btn-landing-demo"
              onClick={handleDemoAccess}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo Mode</span>
            </button>

            {/* Primary Sign In Button */}
            <button
              id="btn-landing-signin-top"
              onClick={onGoToSignIn}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>{language === 'hi' ? 'साइन इन करें' : 'Sign In with Google'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-emerald-50/70 via-white to-slate-50">
        {/* Subtle Decorative Backdrop Blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {language === 'hi'
                  ? 'भारतीय किसानों के लिए समर्पित डिजिटल कृषि क्रांति'
                  : 'Empowering Indian Farmers with Multimodal AI & Satellite Telemetry'}
              </span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {language === 'hi' ? (
                <>
                  आपकी फसल की हर समस्या का समाधान, <br />
                  <span className="text-emerald-700">सटीक AI कृषि साथी</span> के साथ
                </>
              ) : (
                <>
                  Precision AI Agronomy &amp; <br />
                  <span className="text-emerald-700">Real Satellite Monitoring</span> for Indian Agriculture
                </>
              )}
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {language === 'hi'
                ? 'रोग पहचान के लिए पत्तों की फोटो लें, उपग्रह से फसल की सेहत जांचें, और अपनी भाषा में कृषि विशेषज्ञों से सलाह पाएं। सुरक्षित रूप से अपने खेत का डेटा सहेजने के लिए गूगल से लॉगिन करें।'
                : 'Instant vision-based crop disease diagnosis, real-time multispectral NDVI satellite monitoring, weather spray windows, and 24/7 bilingual voice advice in Hindi & English.'}
            </p>

            {/* Key Requirement Notice */}
            <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl max-w-xl mx-auto text-xs text-amber-900 flex items-center justify-center gap-2 shadow-2xs">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-left font-medium">
                {language === 'hi'
                  ? 'खेत का क्षेत्रफल, जीपीएस सीमाएं और रोग रिकॉर्ड्स सुरक्षित रखने हेतु गूगल साइन इन आवश्यक है।'
                  : 'Google Sign-In is required to securely provision your private Firestore farm database & synchronize telemetry.'}
              </span>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="btn-hero-signin-primary"
                onClick={onGoToSignIn}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{language === 'hi' ? 'साइन इन करें और खेत जोड़ें' : 'Sign In with Google to Enter'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="btn-hero-demo-quick"
                onClick={handleDemoAccess}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-semibold text-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>{language === 'hi' ? 'डेमो किसान मोड (परीक्षण)' : 'Try Demo Farmer Mode'}</span>
              </button>
            </div>

            {/* Quick Micro-Proofs */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Google Cloud Firestore</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>True Spaceborne Satellite Imagery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Subscription Fees</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4 CORE CAPABILITY PILLARS                                */}
      {/* ========================================================= */}
      <section className="py-16 md:py-20 bg-white border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Complete Agronomic Workflow • सम्पूर्ण कृषि समाधान
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Designed for Everyday Farm Decision Making
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Every feature is built around the real conditions of Indian smallholder and commercial farming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1: AI Voice Saathi */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquareText className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                AI Saathi Voice Copilot
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Speak or type in Hindi and English. Get immediate answers tailored to your specific crop stage, fertilizer dosage, and IPM organic remedies.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <span>Hindi &amp; English Speech Synthesis</span>
              </div>
            </div>

            {/* Pillar 2: Leaf Disease Vision Scanner */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ScanLine className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Two-Stage Disease Scanner
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                First identifies the botanical plant specimen (Banana, Wheat, Tomato, Soybean) to prevent cross-crop errors, then detects fungal, bacterial, and pest symptoms.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                <span>Botanical Morphology Match</span>
              </div>
            </div>

            {/* Pillar 3: Real Satellite Map & NDVI */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6 text-purple-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Real Satellite Telemetry
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pan, zoom, and inspect real high-resolution spaceborne tiles. Measure farm boundary acreage, view NDVI canopy health, and inspect root moisture.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                <span>True Sub-Meter Aerial Layers</span>
              </div>
            </div>

            {/* Pillar 4: Weather & APMC Mandi Rates */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Mandi Rates &amp; Spray Windows
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check whether today is safe for chemical spraying based on wind and rain probabilities, and monitor real-time APMC price movements across Indian mandis.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                <span>Microclimate Forecasts</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* WHY SIGN IN WITH GOOGLE IS ESSENTIAL                      */}
      {/* ========================================================= */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cloud Security &amp; Data Isolation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Why Google Sign-In is Essential Before Accessing
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Your agricultural operations require reliable records that do not disappear when you clear your mobile browser cache.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Private Firestore Database</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Signing in automatically links your unique Google UID to your isolated cloud database schema, strictly protected by security rules.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-sm text-white">Field Scans &amp; Spray Logs</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every leaf diagnosis, identified disease, and generated remedy is saved so you can track treatment outcomes over the entire crop season.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Multi-Device Access</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take photos on your smartphone in the field and view high-resolution satellite maps on your laptop or tablet with automatic synchronization.
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <button
              id="btn-landing-signin-bottom"
              onClick={onGoToSignIn}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all cursor-pointer"
            >
              <span>Proceed to Sign In / Login Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER                                                    */}
      {/* ========================================================= */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-700">KrishiSaathi AI</span>
            <span>• National Agritech Platform for Bharat</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onGoToSignIn} className="hover:text-emerald-700 font-semibold cursor-pointer">
              Sign In with Google
            </button>
            <span>•</span>
            <button onClick={handleDemoAccess} className="hover:text-emerald-700 font-semibold cursor-pointer">
              Demo Access
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
