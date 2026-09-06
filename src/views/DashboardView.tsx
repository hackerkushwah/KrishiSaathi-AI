import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  CloudSun, 
  Sun,
  Droplets, 
  Wind, 
  Bot, 
  ScanLine, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  BellRing,
  Send
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { farm, profile, weather, advisories, setActiveTab, setPresetAiQuery, t, toggleAdvisoryStatus } = useFarm();
  const [quickInput, setQuickInput] = useState('');

  const handleAskPreset = (queryText: string) => {
    setPresetAiQuery(queryText);
    setActiveTab('ai_saathi');
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    setPresetAiQuery(quickInput);
    setActiveTab('ai_saathi');
  };

  const recentAdvisories = advisories.slice(0, 3);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* 12-COLUMN BENTO GRID: PROFESSIONAL POLISH THEME           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ------------------------------------------------------- */}
        {/* LEFT COLUMN: HERO / ANALYTICS (lg:col-span-8)           */}
        {/* ------------------------------------------------------- */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* TOP 2 CARDS: FARM HEALTH & WEATHER FORECAST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* FARM HEALTH SCORE CARD */}
            <div 
              id="card-farm-health-score"
              className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  {t('farm_health_score')}
                </span>
                <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/60">
                  +4% this week
                </span>
              </div>

              <div className="flex items-center justify-center my-3 relative">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="54" 
                    stroke="#f1f5f9" 
                    strokeWidth="9" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="54" 
                    stroke="#10b981" 
                    strokeWidth="9" 
                    fill="transparent" 
                    strokeDasharray="339.29" 
                    strokeDashoffset="61.07" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">82</span>
                  <span className="text-[10px] text-slate-400 font-semibold">/ 100</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-600 text-center leading-relaxed mt-1">
                Your crop health is <span className="text-emerald-600 font-bold uppercase">Stable</span> based on recent visual and soil analysis.
              </p>
            </div>

            {/* WEATHER FORECAST CARD */}
            <div 
              id="card-weather-summary"
              className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  Today's Forecast
                </span>
                <Sun className="w-5 h-5 text-amber-500" />
              </div>

              <div className="my-2">
                <div className="text-4xl font-bold text-slate-800 mb-1 tracking-tight">
                  {weather?.temperature ?? 32}°C
                </div>
                <div className="text-slate-500 text-xs md:text-sm font-medium italic">
                  {weather?.condition || 'Partly Cloudy'} • Humidity {weather?.humidity ?? 62}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {t('weather_rain_prob')}
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {weather?.rain_probability ?? 12}%
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {t('weather_wind')}
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {weather?.wind_speed ?? 14} km/h
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Spray Win.
                  </div>
                  <div className="text-sm font-bold text-emerald-600">
                    {weather?.spray_window_good ? 'Ideal' : 'Caution'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* AI SAATHI PREVIEW CARD (SIGNATURE EMERALD HERO) */}
          <div 
            id="card-ai-saathi-preview"
            className="bg-emerald-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex-1 flex flex-col justify-between shadow-sm"
          >
            {/* Ambient decorative orb */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-800 rounded-full opacity-20 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-emerald-300 font-semibold text-xs tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>KrishiSaathi AI Core</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">
                Ask anything about your farm
              </h3>
              
              {/* Preset prompt pills */}
              <div className="flex gap-2 flex-wrap mb-6">
                <button
                  onClick={() => handleAskPreset('Is it safe to spray fungicide or foliar spray today?')}
                  className="bg-emerald-800/50 hover:bg-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-700/50 transition-colors text-left"
                >
                  &ldquo;Is it safe to spray today?&rdquo;
                </button>
                <button
                  onClick={() => handleAskPreset(`What is the recommended fertilizer schedule for ${farm?.crop_name || 'wheat'}?`)}
                  className="bg-emerald-800/50 hover:bg-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-700/50 transition-colors text-left"
                >
                  &ldquo;Fertilizer dose for {farm?.crop_name || 'crop'}&rdquo;
                </button>
                <button
                  onClick={() => handleAskPreset(`How to control leaf yellowing and sucking pests in ${farm?.district || 'our area'}?`)}
                  className="bg-emerald-800/50 hover:bg-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-700/50 transition-colors text-left"
                >
                  &ldquo;Control yellowing & pests&rdquo;
                </button>
              </div>
            </div>

            {/* Glassmorphic interactive input field */}
            <form onSubmit={handleQuickSubmit} className="relative z-10">
              <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 items-center gap-2">
                <input 
                  type="text" 
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="e.g., How much DAP & urea per acre?" 
                  className="bg-transparent flex-1 px-4 text-white placeholder:text-white/50 focus:outline-none text-xs md:text-sm"
                />
                <button 
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 transition-colors px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <span>Ask AI</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* ------------------------------------------------------- */}
        {/* RIGHT COLUMN: SIDE ACTIONS (lg:col-span-4)              */}
        {/* ------------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* RECENT ADVISORIES CARD */}
          <div 
            id="card-recent-advisories"
            className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Recent Advisories</h3>
                  <span className="text-xs text-slate-500">Live field recommendations</span>
                </div>
              </div>

              <div className="space-y-3.5">
                {recentAdvisories.length > 0 ? (
                  recentAdvisories.slice(0, 2).map((adv, idx) => (
                    <div 
                      key={adv.id} 
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          idx === 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {adv.category || 'Farming Advisory'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(adv.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 leading-snug">
                        {adv.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">
                        {adv.summary}
                      </p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <span className="text-xs font-bold text-emerald-600 uppercase">Spray Advisory</span>
                      <h4 className="text-sm font-semibold text-slate-800 mt-0.5">Clear window until 4:00 PM</h4>
                      <p className="text-xs text-slate-500 mt-1 italic">Wind speeds are low; humidity ideal for foliar nutrition.</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <span className="text-xs font-bold text-amber-600 uppercase">Disease Alert</span>
                      <h4 className="text-sm font-semibold text-slate-800 mt-0.5">Yellow Mosaic Risk High</h4>
                      <p className="text-xs text-slate-500 mt-1 italic">Whitefly vector activity detected in nearby villages.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button 
              id="btn-view-all-advisories"
              onClick={() => setActiveTab('advisories')}
              className="w-full mt-5 py-3 text-emerald-600 font-bold text-sm bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors text-center block"
            >
              {t('view_all_advisories')}
            </button>
          </div>

          {/* QUICK SCAN CROP DISEASE BUTTON */}
          <div 
            id="card-quick-scan-cta"
            onClick={() => setActiveTab('scanner')}
            className="bg-white p-6 rounded-3xl border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center gap-3 hover:border-emerald-400 group transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <ScanLine className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-800 text-sm md:text-base">
                Quick Scan Crop Disease
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Upload leaf photo for instant diagnosis
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* SYSTEM STATUS FOOTER                                      */}
      {/* ========================================================= */}
      <footer className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
            System Live
          </span>
          <span>Last Sync: 10:45 AM</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Satellite Insight: Active</span>
          <span>{farm?.district || 'Field'} Weather: Reliable</span>
        </div>
      </footer>

    </div>
  );
};
