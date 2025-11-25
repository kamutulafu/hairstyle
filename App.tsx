import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisView from './components/AnalysisView';
import { analyzeFaceAndHair, generateHairstylePreview } from './services/geminiService';
import { AppState, AnalysisResult, HairstyleOption, Language } from './types';
import { translations } from './translations';
import { Sparkles, ArrowLeft, Download, AlertCircle, Loader2, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [language, setLanguage] = useState<Language>('zh');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HairstyleOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  const handleImageSelected = async (base64: string) => {
    setOriginalImage(base64);
    setAppState(AppState.ANALYZING);
    setIsLoading(true);
    setLoadingMessage(t.analyzing);
    setError(null);

    try {
      const result = await analyzeFaceAndHair(base64, language);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
    } catch (err) {
      setError(t.errorAnalysis);
      setAppState(AppState.UPLOAD);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryStyle = async (style: HairstyleOption) => {
    if (!originalImage) return;
    
    setSelectedStyle(style);
    setGeneratedImage(null); // Clear previous
    setAppState(AppState.GENERATING);
    setIsLoading(true);
    setLoadingMessage(`${t.generating} (${style.label})...`);
    setError(null);

    try {
      const newImage = await generateHairstylePreview(originalImage, style.promptModifier);
      setGeneratedImage(newImage);
    } catch (err) {
      setError(t.errorGeneration);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAppState(AppState.UPLOAD);
    setOriginalImage(null);
    setGeneratedImage(null);
    setAnalysisResult(null);
    setSelectedStyle(null);
    setError(null);
  };

  const handleBackToResults = () => {
      setAppState(AppState.RESULTS);
      setGeneratedImage(null);
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white selection:bg-pink-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
               {t.appTitle}
             </span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Language Selector */}
             <div className="relative group">
               <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800">
                 <Globe className="w-4 h-4" />
                 <span className="uppercase">{language}</span>
               </button>
               <div className="absolute right-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden hidden group-hover:block">
                 <button onClick={() => setLanguage('zh')} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${language === 'zh' ? 'text-indigo-400' : 'text-slate-300'}`}>中文</button>
                 <button onClick={() => setLanguage('en')} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${language === 'en' ? 'text-indigo-400' : 'text-slate-300'}`}>English</button>
                 <button onClick={() => setLanguage('ja')} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${language === 'ja' ? 'text-indigo-400' : 'text-slate-300'}`}>日本語</button>
                 <button onClick={() => setLanguage('ko')} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${language === 'ko' ? 'text-indigo-400' : 'text-slate-300'}`}>한국어</button>
               </div>
             </div>

             {appState !== AppState.UPLOAD && (
               <button onClick={handleReset} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {t.startOver}
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)]">
        
        {/* Error Banner */}
        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200">
             <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
             <p className="text-sm">{error}</p>
          </div>
        )}

        {/* State: UPLOAD */}
        {appState === AppState.UPLOAD && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
             <div className="text-center max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                   {t.heroTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">{t.heroHighlight}</span>
                </h1>
                <p className="text-lg text-slate-400">
                   {t.heroDesc}
                </p>
             </div>
             <ImageUploader onImageSelected={handleImageSelected} t={t} />
          </div>
        )}

        {/* State: LOADING (Analyzing or Generating) */}
        {isLoading && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
              <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                 <Loader2 className="w-16 h-16 text-white animate-spin relative z-10" />
              </div>
              <h2 className="text-2xl font-semibold mt-6 text-white">{appState === AppState.ANALYZING ? t.analyzing : t.generating}</h2>
              <p className="text-slate-400 mt-2">{loadingMessage}</p>
           </div>
        )}

        {/* State: RESULTS */}
        {appState === AppState.RESULTS && analysisResult && (
          <div className="space-y-8">
             <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-2 border-slate-600 flex-shrink-0">
                   <img src={originalImage!} alt="Original" className="w-full h-full object-cover" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-white">{t.analysisComplete}</h2>
                   <p className="text-slate-400">{t.analysisDesc}</p>
                </div>
             </div>
             <AnalysisView result={analysisResult} onTryStyle={handleTryStyle} t={t} />
          </div>
        )}

        {/* State: GENERATING (Already handled by isLoading) or DISPLAYING GENERATED RESULT */}
        {appState === AppState.GENERATING && !isLoading && generatedImage && (
           <div className="max-w-5xl mx-auto animate-fade-in">
              <button 
                onClick={handleBackToResults}
                className="mb-6 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> {t.backToStyles}
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Before */}
                 <div className="space-y-3">
                    <h3 className="text-lg font-medium text-slate-300 text-center">{t.original}</h3>
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-700 bg-black relative group">
                       <img src={originalImage!} alt="Original" className="w-full h-full object-cover" />
                    </div>
                 </div>

                 {/* After */}
                 <div className="space-y-3">
                    <h3 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 text-center flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        {selectedStyle?.label} {t.result}
                    </h3>
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-black relative shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                       <img src={generatedImage} alt="Generated Hairstyle" className="w-full h-full object-cover" />
                       <a 
                         href={generatedImage} 
                         download={`styleai-${selectedStyle?.id}.png`}
                         className="absolute bottom-4 right-4 p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full transition-all"
                         title={t.download}
                       >
                          <Download className="w-5 h-5" />
                       </a>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-slate-500">AI generated preview. Results may vary.</p>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;