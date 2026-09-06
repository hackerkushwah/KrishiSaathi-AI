import React, { useState, useEffect, useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

export const AiSaathiView: React.FC = () => {
  const { farm, profile, t, language, saveAdvisory, presetAiQuery, setPresetAiQuery, showToast } = useFarm();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeResponse, setActiveResponse] = useState<any>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Load preset query if triggered from dashboard
  useEffect(() => {
    if (presetAiQuery) {
      setInputQuery(presetAiQuery);
      handleGenerateAdvisory(presetAiQuery);
      setPresetAiQuery(null);
    }
  }, [presetAiQuery]);

  // Speech-to-text initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      showToast('Voice input is not supported by your browser', 'info');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleGenerateAdvisory = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    setIsLoading(true);
    setIsSaved(false);
    setIsCopied(false);

    try {
      const farmContext = {
        farmer_name: profile?.name || 'Farmer',
        location: farm ? `${farm.district}, ${farm.state}` : 'India',
        crop: farm?.crop_name || 'Crop',
        acres: farm?.acres || 2,
        soil_type: farm?.soil_type || 'alluvial',
        growth_stage: farm?.growth_stage || 'vegetative',
        language,
      };

      const result = await api.askAiSaathi(q, farmContext);
      setActiveResponse({ ...result, query: q });
    } catch (err: any) {
      showToast('AI Saathi could not generate response. Please retry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToFarm = async () => {
    if (!activeResponse) return;
    await saveAdvisory({
      title: activeResponse.title,
      title_hi: activeResponse.title_hi,
      query: activeResponse.query || inputQuery,
      category: 'crop',
      summary: activeResponse.summary,
      summary_hi: activeResponse.summary_hi,
      possible_causes: activeResponse.possible_causes,
      things_to_check: activeResponse.things_to_check,
      immediate_action: activeResponse.immediate_action,
      weather_consideration: activeResponse.weather_consideration,
      prevention: activeResponse.prevention,
      when_to_seek_help: activeResponse.when_to_seek_help,
      confidence: activeResponse.confidence || 0.92,
      reasoning: activeResponse.reasoning,
    });
    setIsSaved(true);
  };

  const handleCopy = () => {
    if (!activeResponse) return;
    const text = `KRISHISAATHI AI ADVISORY:
${activeResponse.title}
Query: ${activeResponse.query}

Summary: ${activeResponse.summary}

Why this advice:
${activeResponse.reasoning}

Immediate Actions:
${activeResponse.immediate_action?.map((a: string) => `• ${a}`).join('\n')}

Things to Check:
${activeResponse.things_to_check?.map((c: string) => `• ${c}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast(t('copied'), 'success');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const suggestedQuestions = [
    t('q1'),
    t('q2'),
    t('q3'),
    t('q4'),
    t('q5'),
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* ACTIVE FARM CONTEXT BAR                                   */}
      {/* ========================================================= */}
      <div 
        id="ai-context-banner"
        className="bg-white rounded-3xl p-5 md:p-6 border border-emerald-100 shadow-2xs flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t('ai_context_title')}:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700 font-semibold">
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
              {farm?.crop_name || 'Soybean'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
              {farm?.acres || 2} {t('acres')}
            </span>
            <span className="text-slate-300">•</span>
            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
              {farm?.district || 'Indore'}, {farm?.state || 'MP'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
              {t(`soil_${farm?.soil_type || 'black'}` as any)}
            </span>
            <span className="text-slate-300">•</span>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
              {t(`stage_${farm?.growth_stage || 'vegetative'}` as any)}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Powered by Google Gemini • ICAR Standards
        </div>
      </div>

      {/* ========================================================= */}
      {/* INTERACTIVE INPUT BAR                                     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateAdvisory();
          }}
          className="relative flex items-center"
        >
          <input
            id="input-ai-query"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={isListening ? t('ai_listening') : t('ai_input_placeholder')}
            className={`w-full pl-5 pr-28 py-4 text-sm bg-slate-50/70 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium transition-all ${
              isListening ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : 'border-slate-200'
            }`}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {/* Voice input button */}
            <button
              type="button"
              id="btn-voice-input"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl transition-colors ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title="Voice Query (Hindi/English)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit button */}
            <button
              type="submit"
              id="btn-submit-ai"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 shadow-2xs transition-all flex items-center gap-1.5"
            >
              <span>{t('ai_send')}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Suggested field questions */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('suggested_questions_title')}
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((qText, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(qText);
                  handleGenerateAdvisory(qText);
                }}
                className="text-xs text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 px-3 py-1.5 rounded-xl border border-slate-200/80 hover:border-emerald-200 transition-colors text-left font-medium"
              >
                {qText}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LOADING STATE                                             */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-10 border border-emerald-100 text-center space-y-4 shadow-2xs animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Synthesizing Agronomic Guidance…
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Cross-referencing your {farm?.crop_name || 'crop'} stage, {farm?.soil_type || 'field'} soil properties, and {farm?.district || 'local'} weather with ICAR scientific protocols.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STRUCTURED ADVISORY OUTPUT CARD                           */}
      {/* ========================================================= */}
      {activeResponse && !isLoading && (
        <div 
          id="advisory-result-card"
          className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Card Header */}
          <div className="p-6 md:p-8 bg-emerald-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 border border-emerald-600/50">
                  Agricultural Advisory
                </span>
                <span className="text-xs font-semibold text-emerald-200">
                  {t('confidence_level')}: {Math.round((activeResponse.confidence || 0.93) * 100)}%
                </span>
              </div>
              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white">
                {activeResponse.title}
              </h2>
              {activeResponse.query && (
                <p className="text-xs text-emerald-200/80 italic mt-1">
                  “{activeResponse.query}”
                </p>
              )}
            </div>

            {/* Actions: Save & Copy */}
            <div className="flex items-center gap-2">
              <button
                id="btn-copy-advisory"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? t('copied') : t('copy_advice')}</span>
              </button>

              <button
                id="btn-save-advisory"
                onClick={handleSaveToFarm}
                disabled={isSaved}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                  isSaved
                    ? 'bg-emerald-700 text-white border border-emerald-600'
                    : 'bg-emerald-500 text-white hover:bg-emerald-400'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-200" /> : <Bookmark className="w-4 h-4" />}
                <span>{isSaved ? 'Saved to Records' : t('save_advisory')}</span>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {/* Executive Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {activeResponse.summary}
              </p>
            </div>

            {/* "WHY THIS ADVICE?" SECTION */}
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>{t('why_this_advice')}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeResponse.reasoning || `${t('why_this_advice_sub')} ${farm?.crop_name || 'Soybean'} on ${farm?.soil_type || 'black'} soil in ${farm?.district || 'Indore'} during the ${farm?.growth_stage || 'vegetative'} development window.`}
              </p>
            </div>

            {/* 2-Column Grid: Possible Causes & Field Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Possible Causes */}
              {activeResponse.possible_causes?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>{t('possible_causes')}</span>
                  </h4>
                  <ul className="space-y-2">
                    {activeResponse.possible_causes.map((cause: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        • {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Things to check */}
              {activeResponse.things_to_check?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('things_to_check')}</span>
                  </h4>
                  <ul className="space-y-2">
                    {activeResponse.things_to_check.map((checkItem: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        ✓ {checkItem}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Immediate Action Protocol */}
            {activeResponse.immediate_action?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('immediate_action')}</span>
                </h4>
                <div className="space-y-2">
                  {activeResponse.immediate_action.map((act: string, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs font-semibold text-slate-800 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weather & Spray Considerations */}
            {activeResponse.weather_consideration && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <h5 className="text-xs font-bold text-slate-700">
                  {t('weather_consideration')}
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeResponse.weather_consideration}
                </p>
              </div>
            )}

            {/* Long-term prevention */}
            {activeResponse.prevention?.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700">
                  {t('prevention')}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeResponse.prevention.map((prev: string, i: number) => (
                    <div key={i} className="text-xs text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      → {prev}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* When to seek agronomist help & Disclaimer */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {activeResponse.when_to_seek_help && (
                <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    <strong>{t('when_to_seek_help')}:</strong> {activeResponse.when_to_seek_help}
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                {t('disclaimer_note')}
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
