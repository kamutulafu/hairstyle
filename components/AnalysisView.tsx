import React from 'react';
import { AnalysisResult, HairstyleOption } from '../types';
import { Sparkles, CheckCircle2, Scissors } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  onTryStyle: (style: HairstyleOption) => void;
  t: any; // Translation object
}

// Helper to get translated styles
const getPredefinedStyles = (t: any): HairstyleOption[] => [
  { id: 'pixie', label: t.styles.pixie, promptModifier: 'short pixie cut, chic and modern', iconUrl: '' },
  { id: 'bob', label: t.styles.bob, promptModifier: 'chin-length classic bob hairstyle', iconUrl: '' },
  { id: 'long-wavy', label: t.styles.longWavy, promptModifier: 'long flowing wavy hair, bohemian style', iconUrl: '' },
  { id: 'straight-bangs', label: t.styles.straightBangs, promptModifier: 'long straight hair with full bangs', iconUrl: '' },
  { id: 'buzz', label: t.styles.buzz, promptModifier: 'very short buzz cut hairstyle', iconUrl: '' },
  { id: 'curly-afro', label: t.styles.curlyAfro, promptModifier: 'voluminous natural curly afro hairstyle', iconUrl: '' },
  { id: 'layered', label: t.styles.layered, promptModifier: 'shoulder length layered haircut with texture', iconUrl: '' },
  { id: 'side-part', label: t.styles.sidePart, promptModifier: 'sleek side-parted hairstyle', iconUrl: '' },
];

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onTryStyle, t }) => {
  const predefinedStyles = getPredefinedStyles(t);

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Analysis Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                {t.faceAnalysis}
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">{t.faceShape}</label>
                    <p className="text-lg text-indigo-300 font-medium">{result.faceShape}</p>
                </div>
                <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">{t.keyFeatures}</label>
                    <p className="text-sm text-slate-300 leading-relaxed">{result.features}</p>
                </div>
                <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-500/30">
                    <label className="text-xs text-indigo-400 uppercase tracking-wider font-bold">{t.proAdvice}</label>
                    <p className="text-sm text-indigo-200 mt-1">{result.advice}</p>
                </div>
            </div>
        </div>

        {/* AI Suggestions List */}
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-4">{t.recommendedStyles}</h3>
            <ul className="space-y-3">
                {result.suggestions.map((sugg, idx) => (
                    <li key={idx} className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                        <div className="flex justify-between items-start">
                            <span className="font-medium text-white">{sugg.name}</span>
                            {sugg.suitability === 'High' && (
                                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{t.bestMatch}</span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{sugg.description}</p>
                        <button 
                           onClick={() => onTryStyle({
                               id: `sugg-${idx}`,
                               label: sugg.name,
                               promptModifier: `${sugg.name} hairstyle`,
                               iconUrl: ''
                           })}
                           className="mt-2 text-xs flex items-center gap-1 text-secondary hover:text-pink-300 font-medium"
                        >
                           <Scissors className="w-3 h-3" /> {t.tryThis}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      </div>

      {/* Try-On Selector */}
      <div className="lg:col-span-2">
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700 h-full backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">{t.virtualStudio}</h3>
            <p className="text-slate-400 mb-6">{t.studioDesc}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {predefinedStyles.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => onTryStyle(style)}
                        className="group flex flex-col items-center p-4 rounded-xl bg-slate-700/50 border border-slate-600 hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-600 group-hover:bg-white/20 flex items-center justify-center mb-3 transition-colors">
                            <Scissors className="w-6 h-6 text-slate-300 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-200 group-hover:text-white text-center">{style.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="text-sm text-slate-400">
                        <p className="font-semibold text-slate-300 mb-1">{t.tipsTitle}</p>
                        <p>{t.tipsContent}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;