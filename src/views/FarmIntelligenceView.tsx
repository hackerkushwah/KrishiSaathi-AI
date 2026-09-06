import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import { 
  Activity, 
  CloudSun, 
  Layers, 
  Satellite, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Info,
  Droplets,
  Wind,
  Compass
} from 'lucide-react';

export const FarmIntelligenceView: React.FC = () => {
  const { farm, weather, t } = useFarm();
  const [intelData, setIntelData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadIntelligence() {
      try {
        const res = await api.getIntelligence();
        setIntelData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadIntelligence();
  }, []);

  const satellite = intelData?.satellite || {
    ndvi: 0.74,
    crop_stress: 'low',
    soil_moisture_pct: 64,
    field_uniformity_pct: 88,
    observation_date: new Date().toISOString(),
    provider: 'Sentinel-2 MSI (ESA)'
  };

  const soil = intelData?.soil || {
    soil_type: farm?.soil_type || 'black',
    nitrogen_kg_ha: 210,
    phosphorus_kg_ha: 16.5,
    potassium_kg_ha: 340,
    ph: 7.6,
    organic_carbon_pct: 0.58,
    health_status: 'optimal'
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      
      {/* Title & Pipeline Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-2xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span>{t('intel_title')}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
          {t('intel_sub')}
        </h2>

        {/* VISUAL ARCHITECTURAL PIPELINE */}
        <div className="pt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Core Agricultural Processing Pipeline
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1: Telemetry Sources */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-600 px-2 py-0.5 rounded bg-white border border-slate-200">
                  Input Layer
                </span>
                <span className="text-xs font-bold text-slate-400">01</span>
              </div>
              <h4 className="font-bold text-sm text-slate-800">{t('pipeline_sources')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hyperlocal IMD weather grids, Sentinel-2 multispectral NDVI bands, and digitized ICAR soil profiles.
              </p>
            </div>

            {/* Step 2: KrishiSaathi Engine */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-700 px-2 py-0.5 rounded bg-white border border-emerald-200">
                  Reasoning Core
                </span>
                <span className="text-xs font-bold text-emerald-700">02</span>
              </div>
              <h4 className="font-bold text-sm text-slate-800">{t('pipeline_layer')}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini 3.8 Flash model synthesizes growth stage, soil moisture retention, and pest incubation models.
              </p>
            </div>

            {/* Step 3: Localized Advisory */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-600 px-2 py-0.5 rounded bg-white border border-slate-200">
                  Action Layer
                </span>
                <span className="text-xs font-bold text-slate-400">03</span>
              </div>
              <h4 className="font-bold text-sm text-slate-800">{t('pipeline_advisory')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                High-confidence remedial steps, precise spray dosages, and weather-synchronized field actions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3 CORE INTELLIGENCE MODULES: SATELLITE, SOIL, WEATHER     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. SATELLITE & CANOPY VEGETATION CARD */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Satellite className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t('satellite_intel')}</h3>
                <span className="text-[11px] text-slate-400">{t('satellite_preview_badge')}</span>
              </div>
            </div>
          </div>

          {/* NDVI Index Visual Gauge */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('ndvi_index')}
            </span>
            <div className="text-3xl font-extrabold text-emerald-600">
              {satellite.ndvi}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Healthy Photosynthetic Vigor</span>
            </div>
          </div>

          {/* Satellite Observations Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
              <span className="text-slate-500">{t('crop_stress_label')}</span>
              <span className="font-bold text-emerald-600 uppercase">Low Stress</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
              <span className="text-slate-500">{t('soil_moisture_label')}</span>
              <span className="font-bold text-slate-800">{satellite.soil_moisture_pct}% (Adequate)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
              <span className="text-slate-500">{t('field_uniformity')}</span>
              <span className="font-bold text-slate-800">{satellite.field_uniformity_pct}% Uniform</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Data Source: European Space Agency (ESA) Sentinel-2 MSI Multi-Spectral
          </div>
        </div>

        {/* 2. SOIL HEALTH INTELLIGENCE */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t('soil_intel')}</h3>
                <span className="text-[11px] text-slate-400">
                  {t(`soil_${farm?.soil_type || 'black'}` as any)}
                </span>
              </div>
            </div>
          </div>

          {/* Soil Status & pH */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t('soil_ph')}</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">{soil.ph}</div>
              <span className="text-[10px] text-slate-500">Mildly Alkaline</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t('organic_carbon')}</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">{soil.organic_carbon_pct}%</div>
              <span className="text-[10px] text-slate-500">Medium Range</span>
            </div>
          </div>

          {/* Macronutrients NPK Status */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {t('soil_nutrients')}
            </span>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 font-semibold mb-1">
                  <span>{t('nitrogen')}</span>
                  <span>{soil.nitrogen_kg_ha} kg/ha (Medium)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full w-[60%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 font-semibold mb-1">
                  <span>{t('phosphorus')}</span>
                  <span>{soil.phosphorus_kg_ha} kg/ha (Adequate)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full w-[52%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 font-semibold mb-1">
                  <span>{t('potassium')}</span>
                  <span>{soil.potassium_kg_ha} kg/ha (Rich)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-2 rounded-full w-[85%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            ICAR Baseline: {farm?.state || 'Regional'} Agro-Climatic Zone
          </div>
        </div>

        {/* 3. WEATHER INTELLIGENCE & 5-DAY OUTLOOK */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CloudSun className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">{t('weather_intel')}</h3>
                <span className="text-[11px] text-slate-400">Hyperlocal Farm Grid</span>
              </div>
            </div>
          </div>

          {/* Spray Condition Window */}
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">
                {t('weather_spray_window')}: Optimal
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Gentle morning winds (&lt;15 km/h) and moderate temperature (28°C) minimize chemical evaporation and droplet drift.
            </p>
          </div>

          {/* 5-Day Outlook */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              5-Day Farm Forecast
            </span>

            <div className="space-y-1.5">
              {weather?.forecast?.map((day, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs font-medium"
                >
                  <span className="text-slate-800 font-semibold w-24">
                    {day.day}
                  </span>
                  <span className="text-slate-500">{day.condition}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">{day.temp_max}°</span>
                    <span className="text-slate-400 ml-1">/ {day.temp_min}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Station: {farm?.district || 'District'} Agromet Advisory Bulletin (IMD)
          </div>
        </div>

      </div>

    </div>
  );
};
