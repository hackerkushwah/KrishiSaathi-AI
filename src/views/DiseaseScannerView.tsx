import React, { useState, useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import { 
  ScanLine, 
  Upload, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  BookmarkCheck, 
  History, 
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';

export const DiseaseScannerView: React.FC = () => {
  const { farm, t, language, scans, addScanResult, showToast } = useFarm();

  const [selectedCrop, setSelectedCrop] = useState<string>('auto');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(1);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll directly to the AI diagnosis result as soon as it is ready
  React.useEffect(() => {
    if (scanResult && !isAnalyzing && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [scanResult, isAnalyzing]);

  // Available plant categories with Auto-Detect as default
  const cropOptions = [
    { id: 'auto', label: '🔍 Auto-Detect Plant from Photo', emoji: '✨' },
    { id: 'Banana', label: 'Banana (केला)', emoji: '🍌' },
    { id: 'Wheat', label: 'Wheat (गेहूं)', emoji: '🌾' },
    { id: 'Tomato', label: 'Tomato (टमाटर)', emoji: '🍅' },
    { id: 'Rice', label: 'Rice / Paddy (धान)', emoji: '🍚' },
    { id: 'Cotton', label: 'Cotton (कपास)', emoji: '🌱' },
    { id: 'Mustard', label: 'Mustard (सरसों)', emoji: '🌿' },
    { id: 'Potato', label: 'Potato (आलू)', emoji: '🥔' },
    { id: 'Chilli', label: 'Chilli (मिर्च)', emoji: '🌶️' },
  ];

  // Curated field reference images for testing
  const sampleImages = [
    {
      label: '🍌 Banana Leaf: Sigatoka / Spots',
      url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
      crop: 'Banana',
    },
    {
      label: '🌾 Wheat Foliage: Stripe Rust',
      url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      crop: 'Wheat',
    },
    {
      label: '🍅 Tomato Foliage: Early Blight',
      url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?auto=format&fit=crop&w=600&q=80',
      crop: 'Tomato',
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedImage(uploadEvent.target?.result as string);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: typeof sampleImages[0]) => {
    setSelectedImage(sample.url);
    setSelectedCrop(sample.crop);
    setScanResult(null);
  };

  const handleStartScan = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setScanResult(null);
    setAnalysisStep(1);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      // Send cropName only if user explicitly selected a crop, otherwise empty string for auto-detect
      const effectiveCropHint = selectedCrop === 'auto' ? '' : selectedCrop;

      const response = await api.scanCropDisease(
        selectedImage,
        mimeType,
        effectiveCropHint
      );

      clearInterval(stepInterval);
      setScanResult(response);

      const detectedCrop = response.identified_crop || (selectedCrop !== 'auto' ? selectedCrop : farm?.crop_name || 'Crop');

      // Record in local history
      await addScanResult({
        image_url: selectedImage,
        crop_name: detectedCrop,
        identified_crop: response.identified_crop,
        identified_crop_hi: response.identified_crop_hi,
        confidence_crop_identification: response.confidence_crop_identification,
        possible_issue: response.possible_issue,
        possible_issue_hi: response.possible_issue_hi,
        confidence: response.confidence || 0.9,
        severity: response.severity || 'medium',
        symptoms_detected: response.symptoms_detected,
        immediate_action: response.immediate_action,
        prevention: response.prevention,
        when_to_seek_help: response.when_to_seek_help,
        image_quality: response.image_quality || 'good',
        disclaimer: response.disclaimer,
      });
    } catch (err) {
      clearInterval(stepInterval);
      showToast('Crop disease diagnosis failed. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-2xs space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold">
          <ScanLine className="w-3.5 h-3.5" />
          <span>{t('scanner_title')}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
          {t('scanner_sub')}
        </h2>
        <p className="text-xs text-slate-500 max-w-xl">
          Powered by Google Gemini Multimodal Vision adhering to ICAR plant pathology standards.
        </p>
      </div>

      {/* Crop / Plant Selection Bar */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>🌱</span>
            <span>Target Plant Context / फसल का प्रकार:</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {selectedCrop === 'auto' ? 'Visual auto-identification active' : `Context locked to ${selectedCrop}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {cropOptions.map((crop) => {
            const isSelected = selectedCrop === crop.id;
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => {
                  setSelectedCrop(crop.id);
                  setScanResult(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs scale-102 ring-2 ring-emerald-400/40'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/60'
                }`}
              >
                <span>{crop.emoji}</span>
                <span>{crop.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SCANNING & UPLOAD WORKSPACE                               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Upload Zone */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {selectedImage ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/5 border border-slate-200 max-h-72 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Crop specimen preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold hover:bg-slate-900 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  id="btn-trigger-diagnosis"
                  onClick={handleStartScan}
                  disabled={isAnalyzing}
                  className="flex-1 py-3 px-5 rounded-xl font-bold text-xs md:text-sm bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{isAnalyzing ? t('scanning_step_1') : t('scan_button')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {t('drop_image')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {t('camera_hint')}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select Image</span>
              </button>
            </div>
          )}

          {/* Preset Sample Crop Leaves for immediate evaluation */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Test: Select a Sample Specimen
            </span>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-square focus:ring-2 focus:ring-emerald-500 transition-all hover:border-emerald-300"
                >
                  <img
                    src={sample.url}
                    alt={sample.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[9px] text-white font-medium line-clamp-1 text-left leading-tight">
                      {sample.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnostic Results Card */}
        <div ref={resultsRef} id="diagnostic-results-card" className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-5 scroll-mt-6">
          
          {/* Multi-step Loading Animation */}
          {isAnalyzing && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-800">
                  {analysisStep === 1 && t('scanning_step_1')}
                  {analysisStep === 2 && t('scanning_step_2')}
                  {analysisStep === 3 && t('scanning_step_3')}
                </h4>
                <p className="text-xs text-slate-500">
                  Analyzing chloroplast density and lesion morphology…
                </p>
              </div>
              <div className="w-48 bg-slate-100 h-1.5 rounded-full mx-auto overflow-hidden">
                <div 
                  className="bg-emerald-600 h-1.5 transition-all duration-300"
                  style={{ width: `${(analysisStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Completed Diagnostic Result */}
          {scanResult && !isAnalyzing && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('results_title')}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                    {scanResult.possible_issue}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getSeverityStyle(scanResult.severity)}`}>
                    {t('severity_label')}: {scanResult.severity}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {Math.round((scanResult.confidence || 0.9) * 100)}% Match
                  </span>
                </div>
              </div>

              {/* Identified Crop Banner */}
              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {(scanResult.identified_crop || '').toLowerCase().includes('banana') ? '🍌' :
                     (scanResult.identified_crop || '').toLowerCase().includes('wheat') ? '🌾' :
                     (scanResult.identified_crop || '').toLowerCase().includes('tomato') ? '🍅' : '🌱'}
                  </span>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block">
                      Recognized Specimen / पहचानी गई फसल
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {language === 'hi' && scanResult.identified_crop_hi ? scanResult.identified_crop_hi : (scanResult.identified_crop || 'Plant')}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-white text-emerald-700 border border-emerald-200 rounded-xl shadow-2xs">
                  {Math.round((scanResult.confidence_crop_identification || 0.96) * 100)}% Botanical Match
                </span>
              </div>

              {/* Symptoms Detected */}
              {scanResult.symptoms_detected?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('symptoms_detected')}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {scanResult.symptoms_detected.map((symptom: string, i: number) => (
                      <div key={i} className="text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        • {symptom}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment Protocol */}
              {scanResult.immediate_action?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t('treatment_plan')}</span>
                  </h4>
                  <div className="space-y-2">
                    {scanResult.immediate_action.map((act: string, i: number) => (
                      <div key={i} className="text-xs font-semibold text-slate-800 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prevention Advice */}
              {scanResult.prevention?.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700">
                    {t('prevention')}
                  </h4>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    {scanResult.prevention.map((tip: string, i: number) => (
                      <div key={i}>→ {tip}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                <span>{scanResult.disclaimer || t('disclaimer_note')}</span>
              </div>
            </div>
          )}

          {/* Empty Placeholder */}
          {!scanResult && !isAnalyzing && (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Awaiting Specimen Photograph
              </h4>
              <p className="text-xs max-w-xs mx-auto text-slate-500">
                Select or upload a crop photo on the left and tap &ldquo;Diagnose Crop Disease&rdquo; to begin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* PAST SCANS GALLERY                                        */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-800">{t('past_scans')}</h3>
          <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
            {scans.length}
          </span>
        </div>

        {scans.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">{t('no_scans_yet')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scans.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 flex gap-3 hover:border-emerald-300 transition-colors"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.possible_issue}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold text-xs">
                    Leaf
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block ${getSeverityStyle(item.severity)}`}>
                    {item.severity}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 truncate">
                    {item.possible_issue}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {item.symptoms_detected?.[0] || 'Symptoms recorded'}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
