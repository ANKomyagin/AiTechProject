
import React, { useState, useEffect } from 'react';
import type { HistoryItem } from '../types';
import { EmotionChart } from './EmotionChart';
import { SaveIcon } from './icons/SaveIcon';

interface AnalysisResultsProps {
  analysis: HistoryItem;
  onSave: (title: string, speaker: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; color: string; }> = ({ title, value, color }) => (
    <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-sm text-slate-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}{title === 'Overall Score' && '/100'}</p>
    </div>
);

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, onSave }) => {
  const [title, setTitle] = useState(analysis.title);
  const [speaker, setSpeaker] = useState(analysis.speaker);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setTitle(analysis.title);
    setSpeaker(analysis.speaker);
    setIsSaved(false); // Reset save state when analysis changes
  }, [analysis]);
  
  const handleSaveClick = () => {
    onSave(title, speaker);
    setIsSaved(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-800/50 rounded-lg">
        <div className="flex-1">
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-sky-500 focus:outline-none w-full"
            placeholder="Analysis Title"
          />
          <input 
            type="text"
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            className="text-md text-slate-400 bg-transparent border-b-2 border-transparent focus:border-sky-500 focus:outline-none w-full"
            placeholder="Speaker Name"
          />
        </div>
        <button 
          onClick={handleSaveClick}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 rounded-md hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:bg-slate-600"
          disabled={isSaved}
        >
          <SaveIcon/>
          {isSaved ? 'Saved' : 'Save Analysis'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Overall Score" value={analysis.report.overallScore} color="text-sky-400" />
          <StatCard title="Engagement" value={analysis.report.engagement} color="text-amber-400" />
          <StatCard title="Speech Quality" value={analysis.report.speechQuality} color="text-teal-400" />
          <StatCard title="Emotional Variance" value={analysis.report.emotionalVariance} color="text-violet-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-sky-400">AI-Powered Performance Report</h3>
            <div className="space-y-4 text-slate-300">
                <div>
                    <h4 className="font-semibold text-slate-100">Emotional Background</h4>
                    <p>{analysis.report.emotionalBackground}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-100">Structure & Clarity</h4>
                    <p>{analysis.report.structure}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-green-400">Key Strengths</h4>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                            {analysis.report.keyStrengths.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-amber-400">Areas for Improvement</h4>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                            {analysis.report.areasForImprovement.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-sky-400">Emotion Timeline</h3>
            <div className="h-48">
              <EmotionChart data={analysis.emotionData} />
            </div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-sky-400">Transcript</h3>
            <div className="text-slate-300 whitespace-pre-wrap">{analysis.transcript}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
