import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { GrowthStage, SoilType } from '../types';
import { 
  Sprout, 
  MapPin, 
  Ruler, 
  Layers, 
  Activity, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  X
} from 'lucide-react';

export const OnboardingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { farm, profile, firebaseUser, signInWithGoogleAuth, updateFarmData, t, language, showToast } = useFarm();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(profile?.name || '');
  const [district, setDistrict] = useState<string>(farm?.district || '');
  const [state, setState] = useState<string>(farm?.state || '');
  const [acres, setAcres] = useState<number>(farm?.acres || 2);
  const [crop, setCrop] = useState<string>(farm?.crop_name || 'Wheat');
  const [soil, setSoil] = useState<SoilType>(farm?.soil_type || 'alluvial');
  const [stage, setStage] = useState<GrowthStage>(farm?.growth_stage || 'vegetative');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const popularCrops = [
    { id: 'Soybean', label: 'Soybean (सोयाबीन)' },
    { id: 'Wheat', label: 'Wheat (गेहूँ)' },
    { id: 'Cotton', label: 'Cotton (कपास)' },
    { id: 'Rice', label: 'Paddy / Rice (धान)' },
    { id: 'Gram', label: 'Chickpea / Gram (चना)' },
    { id: 'Maize', label: 'Maize (मक्का)' },
    { id: 'Mustard', label: 'Mustard (सरसों)' },
  ];

  const soilOptions: { id: SoilType; labelKey: string }[] = [
    { id: 'black', labelKey: 'soil_black' },
    { id: 'alluvial', labelKey: 'soil_alluvial' },
    { id: 'red', labelKey: 'soil_red' },
    { id: 'clay', labelKey: 'soil_clay' },
    { id: 'sandy_loam', labelKey: 'soil_sandy' },
  ];

  const stageOptions: { id: GrowthStage; labelKey: string; desc: string }[] = [
    { id: 'germination', labelKey: 'stage_germination', desc: '0–14 days: Seedling emergence' },
    { id: 'vegetative', labelKey: 'stage_vegetative', desc: '15–40 days: Active leaf and shoot development' },
    { id: 'flowering', labelKey: 'stage_flowering', desc: '40–60 days: Floral buds & blossoms' },
    { id: 'pod_formation', labelKey: 'stage_pod', desc: '60–85 days: Grain/pod filling' },
    { id: 'maturity', labelKey: 'stage_maturity', desc: '85+ days: Ripening & pre-harvest' },
  ];

  const handleFinish = async () => {
    await updateFarmData({
      farmer_name: name,
      district,
      state,
      acres: Number(acres),
      crop_name: crop,
      soil_type: soil,
      growth_stage: stage,
    });
    setIsCompleted(true);
  };

  const handleEnterDashboard = () => {
    setIsCompleted(false);
    onClose();
    showToast('Farm parameters updated successfully 🌱', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{t('onboarding_title')}</h2>
              <p className="text-xs text-slate-500">
                {isCompleted ? 'Configuration Complete' : `Step ${step} of 6`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {!isCompleted && (
          <div className="w-full bg-slate-100 h-1.5">
            <div 
              className="bg-emerald-600 h-1.5 transition-all duration-300 ease-out" 
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {isCompleted ? (
            /* Celebration Completion Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-600 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{t('onboarding_success_title')}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {t('onboarding_success_sub')}
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Farmer:</span>
                  <span className="font-semibold text-slate-800">{name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800">{district}, {state}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Cultivated Acreage:</span>
                  <span className="font-semibold text-slate-800">{acres} Acres</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Primary Crop:</span>
                  <span className="font-semibold text-slate-800">{crop}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Soil Profile:</span>
                  <span className="font-semibold text-slate-800">{t(`soil_${soil}` as any)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Crop Growth Stage:</span>
                  <span className="font-semibold text-slate-800">{t(`stage_${stage}` as any)}</span>
                </div>
              </div>

              <button
                id="btn-enter-dashboard"
                onClick={handleEnterDashboard}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <span>{t('enter_dashboard')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Progressive Steps */
            <div className="space-y-6">
              {/* STEP 1: Farmer Name */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-800">
                      {t('step_name_label')}
                    </label>
                    <p className="text-xs text-slate-500">
                      Used for personalized advisories and official record keeping.
                    </p>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('step_name_placeholder')}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-semibold transition-all"
                    autoFocus
                  />

                  {!firebaseUser && (
                    <div className="pt-2">
                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Or</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await signInWithGoogleAuth();
                          if (profile?.name) {
                            setName(profile.name);
                          }
                        }}
                        className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {t('step_loc_label')}
                    </label>
                    <p className="text-xs text-slate-500">
                      Enables precise village-level meteorological forecasting and regional soil telemetry.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">District</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Indore"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-semibold transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Madhya Pradesh"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-semibold transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Farm Size */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-emerald-600" />
                      {t('step_acres_label')}
                    </label>
                    <p className="text-xs text-slate-500">
                      Helps calculate exact pesticide dosage, seed quantity, and irrigation volume.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0.25"
                      max="1000"
                      value={acres}
                      onChange={(e) => setAcres(Math.max(0.25, parseFloat(e.target.value) || 1))}
                      className="w-32 px-4 py-3 text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 transition-all"
                    />
                    <span className="text-sm font-semibold text-slate-600">
                      {t('step_acres_unit')}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {[1, 2, 3, 5, 10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAcres(val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          acres === val 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {val} Acres
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Crop */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-800">
                      {t('step_crop_label')}
                    </label>
                    <p className="text-xs text-slate-500">
                      Select the primary standing crop in your field.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {popularCrops.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCrop(c.id)}
                        className={`p-3 text-left rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                          crop === c.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{c.label}</span>
                        {crop === c.id && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Soil Type */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      {t('step_soil_label')}
                    </label>
                    <p className="text-xs text-slate-500">
                      Soil composition determines moisture retention and nutrient fixation.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {soilOptions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSoil(s.id)}
                        className={`w-full p-3 text-left rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                          soil === s.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{t(s.labelKey as any)}</span>
                        {soil === s.id && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: Growth Stage */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      {t('step_stage_label')}
                    </label>
                    <p className="text-xs text-slate-500">
                      Guides appropriate chemical sprays, weed management, and irrigation thresholds.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {stageOptions.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStage(st.id)}
                        className={`w-full p-3 text-left rounded-xl text-xs border transition-all flex items-center justify-between ${
                          stage === st.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-800">{t(st.labelKey as any)}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{st.desc}</div>
                        </div>
                        {stage === st.id && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('back_step')}</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 6 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs transition-all"
                  >
                    <span>{t('next_step')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-100" />
                    <span>{t('finish_onboarding')}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
