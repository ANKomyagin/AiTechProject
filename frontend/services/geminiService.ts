
import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisReport, EmotionDataPoint } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // Fallback for environments where process.env.API_KEY might not be set.
  // In a real production app, this should be handled more securely.
  console.warn("API_KEY is not set. Using a mock service.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const createMockReport = (): AnalysisReport => ({
  emotionalBackground: "The speaker maintained a generally positive and neutral tone, suitable for the topic. There were moments of increased engagement, but no significant negative emotions were detected.",
  speechQuality: "Good",
  engagement: "Moderate",
  emotionalVariance: "Stable",
  structure: "The presentation was well-structured, with a clear introduction, body, and conclusion. Transitions between points were logical and easy to follow.",
  overallScore: 82,
  keyStrengths: ["Clear vocal delivery", "Well-organized content", "Confident posture"],
  areasForImprovement: ["Vary vocal pitch more", "Use more engaging gestures", "Make more eye contact with the audience"],
});

const generatePrompt = (transcript: string, emotionData: EmotionDataPoint[]): string => {
  const emotionSummary = emotionData.reduce((acc, { emotion }) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `
    As an expert public speaking coach, analyze the following speech performance.
    
    **Transcript:**
    ${transcript}

    **Emotion Data Summary (count of segments per emotion):**
    - Positive: ${emotionSummary.positive || 0}
    - Neutral: ${emotionSummary.neutral || 0}
    - Sad: ${emotionSummary.sad || 0}
    - Angry: ${emotionSummary.angry || 0}

    Based on the provided transcript and emotion data, provide a detailed analysis of the speech.
    Evaluate the performance and respond ONLY with a JSON object matching the specified schema. Do not include any other text or markdown formatting.
  `;
};

export const analyzeSpeech = async (transcript: string, emotionData: EmotionDataPoint[]): Promise<AnalysisReport> => {
  if (!ai) {
    return new Promise(resolve => setTimeout(() => resolve(createMockReport()), 1500));
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: generatePrompt(transcript, emotionData),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotionalBackground: { type: Type.STRING, description: 'Overall emotional tone of the speech.' },
            speechQuality: { type: Type.STRING, description: 'Categorical rating (e.g., Excellent, Good, Average, Poor).' },
            engagement: { type: Type.STRING, description: 'How engaging the speech was (e.g., High, Moderate, Low).' },
            emotionalVariance: { type: Type.STRING, description: 'Variety in emotional expression (e.g., Dynamic, Stable, Monotone).' },
            structure: { type: Type.STRING, description: 'Clarity and organization of the speech content.' },
            overallScore: { type: Type.INTEGER, description: 'A numerical score from 0 to 100.' },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 2-3 key strengths.' },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 2-3 actionable improvement areas.' },
          },
          required: ['emotionalBackground', 'speechQuality', 'engagement', 'emotionalVariance', 'structure', 'overallScore', 'keyStrengths', 'areasForImprovement'],
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisReport;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to mock report on API error
    return createMockReport();
  }
};
