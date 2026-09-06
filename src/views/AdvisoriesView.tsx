import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdvisoriesView: React.FC = () => {
  const { advisories, toggleAdvisoryStatus, deleteAdvisory, setActiveTab, t } = useFarm();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', labelKey: 'filter_all' },
    { id: 'crop', labelKey: 'filter_crop' },
    { id: 'weather', labelKey: 'filter_weather' },
    { id: 'disease', labelKey: 'filter_disease' },
    { id: 'soil', labelKey: 'filter_soil' },
  ];

  const filteredAdvisories = advisories.filter((adv) => {
    const matchesCat = activeCategory === 'all' || adv.category === activeCategory;
    const matchesSearch =
      adv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (adv.query && adv.query.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Farm Records</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
            {t('advisories_title')}
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mt-0.5">
            {t('advisories_sub')}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai_saathi')}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Advisory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 md:p-4 rounded-2xl border border-emerald-100 shadow-2xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t(cat.labelKey as any)}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farm records…"
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium transition-all"
          />
        </div>
      </div>

      {/* Advisories List */}
      {filteredAdvisories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-emerald-100 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">
            {t('empty_advisories_title')}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {t('empty_advisories_desc')}
          </p>
          <button
            onClick={() => setActiveTab('ai_saathi')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI Saathi</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAdvisories.map((adv) => {
            const isExpanded = expandedId === adv.id;
            const isResolved = adv.status === 'completed';

            return (
              <div
                key={adv.id}
                className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden transition-all hover:border-emerald-200"
              >
                {/* Item Header */}
                <div
                  onClick={() => toggleExpand(adv.id)}
                  className="p-5 md:p-6 cursor-pointer flex flex-wrap items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-[260px] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {adv.category}
                      </span>
                      {isResolved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t('resolved')}</span>
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(adv.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-800 tracking-tight">
                      {adv.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {adv.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAdvisoryStatus(adv.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                        isResolved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isResolved ? t('resolved') : t('mark_complete')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAdvisory(adv.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete from farm records"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-1 rounded-full text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/50 animate-in fade-in duration-150">
                    {/* Why this advice? */}
                    {adv.reasoning && (
                      <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <Info className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('why_this_advice')}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {adv.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Immediate Actions */}
                    {adv.immediate_action && adv.immediate_action.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>{t('immediate_action')}</span>
                        </h4>
                        <div className="space-y-1.5">
                          {adv.immediate_action.map((act, i) => (
                            <div
                              key={i}
                              className="text-xs font-semibold text-slate-800 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex items-start gap-2"
                            >
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inspection checklist */}
                    {adv.things_to_check && adv.things_to_check.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {t('things_to_check')}
                        </h4>
                        <div className="space-y-1">
                          {adv.things_to_check.map((item, i) => (
                            <div key={i} className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">
                              ✓ {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weather considerations */}
                    {adv.weather_consideration && (
                      <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                        <strong>{t('weather_consideration')}:</strong> {adv.weather_consideration}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
