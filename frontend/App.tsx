
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { FileUpload } from './components/FileUpload';
import { MediaPlayer } from './components/MediaPlayer';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeSpeech } from './services/geminiService';
import type { AnalysisReport, EmotionDataPoint, HistoryItem } from './types';

// Mock Data for demonstration purposes
const generateMockEmotionData = (duration: number): EmotionDataPoint[] => {
  // FIX: Use 'as const' to infer the array elements as literal types, not just string.
  // This ensures type compatibility with the EmotionDataPoint['emotion'] type.
  const emotions = ['positive', 'neutral', 'sad', 'angry'] as const;
  const data: EmotionDataPoint[] = [];
  for (let i = 0; i < duration; i += 5) {
    data.push({
      time: i,
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      score: Math.random(),
    });
  }
  return data;
};

const MOCK_TRANSCRIPT = `Speaker 1: Good morning everyone. Today, I want to talk about the future of artificial intelligence. It's a topic that's both exciting and a little bit daunting.
Speaker 1: First, let's consider the advancements in machine learning. We've seen incredible progress, from self-driving cars to medical diagnostics. This technology has the potential to solve some of the world's most pressing problems.
Speaker 2: I agree, but we also need to be cautious about the ethical implications. How do we ensure that AI is used for good, and not for malicious purposes?
Speaker 1: That's a very important point. It's crucial that we develop strong regulatory frameworks and ethical guidelines. Collaboration between technologists, ethicists, and policymakers is key to navigating this complex landscape. We must build a future where AI serves humanity.`;

export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<HistoryItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load history from localStorage on startup
    const savedHistory = localStorage.getItem('speechAnalysisHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
    setActiveAnalysis(null);
  };

  const handleNewAnalysis = () => {
    setFile(null);
    setFileUrl(null);
    setActiveAnalysis(null);
  };

  const handleAnalysis = async (startTime: number, endTime: number) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      // In a real app, you'd process the audio/video fragment here.
      // For this demo, we'll use mock data to generate a report.
      const duration = endTime - startTime;
      const mockEmotionData = generateMockEmotionData(duration);
      const report = await analyzeSpeech(MOCK_TRANSCRIPT, mockEmotionData);

      const newAnalysis: HistoryItem = {
        id: new Date().toISOString(),
        title: file.name,
        speaker: 'Unknown Speaker',
        date: new Date().toLocaleDateString(),
        audioUrl: fileUrl!,
        transcript: MOCK_TRANSCRIPT,
        emotionData: mockEmotionData,
        report: report,
      };

      setActiveAnalysis(newAnalysis);

    } catch (e) {
      console.error(e);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = (title: string, speaker: string) => {
    if (!activeAnalysis) return;

    const updatedAnalysis = { ...activeAnalysis, title, speaker };
    const newHistory = [updatedAnalysis, ...history.filter(item => item.id !== updatedAnalysis.id)];
    
    setHistory(newHistory);
    setActiveAnalysis(updatedAnalysis);
    localStorage.setItem('speechAnalysisHistory', JSON.stringify(newHistory));
  };
  
  const handleSelectHistoryItem = (id: string) => {
    const item = history.find(h => h.id === id);
    if(item) {
        setActiveAnalysis(item);
        setFile(null); // Clear file upload when viewing history
        setFileUrl(null);
    }
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans">
      <Sidebar history={history} onNewAnalysis={handleNewAnalysis} onSelectHistoryItem={handleSelectHistoryItem} activeId={activeAnalysis?.id}/>
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
        {activeAnalysis ? (
          <AnalysisResults analysis={activeAnalysis} onSave={handleSave} />
        ) : fileUrl ? (
          <MediaPlayer
            fileUrl={fileUrl}
            fileType={file!.type}
            onAnalyze={handleAnalysis}
            isLoading={isLoading}
          />
        ) : (
          <FileUpload onFileSelect={handleFileSelect} />
        )}
        {error && <div className="mt-4 p-4 bg-red-900/50 text-red-300 rounded-lg">{error}</div>}
      </main>
    </div>
  );
}