
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { EmotionDataPoint } from '../types';

interface EmotionChartProps {
  data: EmotionDataPoint[];
}

export const EmotionChart: React.FC<EmotionChartProps> = ({ data }) => {
  // Process data for recharts
  const processedData = data.reduce((acc, curr) => {
    let timePoint = acc.find(p => p.time === curr.time);
    if (!timePoint) {
      timePoint = { time: curr.time };
      acc.push(timePoint);
    }
    (timePoint as any)[curr.emotion] = curr.score;
    return acc;
  }, [] as { time: number; [key: string]: number }[]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={processedData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="time" tickFormatter={formatTime} stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            labelFormatter={formatTime}
        />
        <Legend />
        <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="neutral" stroke="#64748b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="sad" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="angry" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};
