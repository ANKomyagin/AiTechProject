
export interface AnalysisReport {
  emotionalBackground: string;
  speechQuality: string;
  engagement: string;
  emotionalVariance: string;
  structure: string;
  overallScore: number; // A score from 0 to 100
  keyStrengths: string[];
  areasForImprovement: string[];
}

export interface EmotionDataPoint {
  time: number; // in seconds
  emotion: 'positive' | 'neutral' | 'sad' | 'angry';
  score: number; // confidence score 0-1
}

export interface HistoryItem {
  id: string;
  title: string;
  speaker: string;
  date: string;
  audioUrl: string;
  transcript: string;
  emotionData: EmotionDataPoint[];
  report: AnalysisReport;
}
