export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  GENERATING = 'GENERATING'
}

export type Language = 'zh' | 'en' | 'ja' | 'ko';

export interface HairstyleSuggestion {
  name: string;
  description: string;
  suitability: string; // e.g., "High", "Medium"
}

export interface AnalysisResult {
  faceShape: string;
  features: string;
  advice: string;
  suggestions: HairstyleSuggestion[];
}

export interface HairstyleOption {
  id: string;
  label: string;
  promptModifier: string;
  iconUrl: string;
}