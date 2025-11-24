import type { AnalysisReport, EmotionDataPoint } from '../types';

const API_URL = 'http://localhost:8000';

interface BackendResponse {
  transcript: string;
  emotionData: EmotionDataPoint[];
  report: AnalysisReport;
}

export const analyzeSpeech = async (
  file: File,
  startTime: number,
  endTime: number
): Promise<BackendResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  // Конвертируем числа в строки для отправки
  formData.append('start', startTime.toString());
  formData.append('end', endTime.toString());

  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data: BackendResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};
