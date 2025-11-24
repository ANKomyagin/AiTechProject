import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { EmotionDataPoint } from '../types';

interface EmotionChartProps {
  data: EmotionDataPoint[];
}

export const EmotionChart: React.FC<EmotionChartProps> = ({ data }) => {
  const processedData = data.reduce((acc, curr) => {
    let timePoint = acc.find(p => p.time === curr.time);
    if (!timePoint) {
      timePoint = { time: curr.time };
      acc.push(timePoint);
    }
    (timePoint as any)[curr.emotion] = curr.score;
    return acc;
  }, [] as { time: number; [key: string]: number }[]);

  processedData.sort((a, b) => a.time - b.time);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={processedData}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
        <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            stroke="#94a3b8"
            minTickGap={30}
        />
        <YAxis stroke="#94a3b8" domain={[0, 1]} hide />
        <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }}
            labelFormatter={formatTime}
            cursor={{ stroke: '#64748b', strokeWidth: 1 }}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />

        {/*
            ИЗМЕНЕНИЯ:
            1. connectNulls={false} -> Линии прерываются (правильно для смены эмоций).
            2. dot={{ r: 4, strokeWidth: 0, fill: '...' }} -> Точка теперь есть, но она сплошная и чистая.
               Она покажет одиночные данные, но не создаст "кашу".
        */}
        <Line
            type="monotone"
            dataKey="positive"
            stroke="#22c55e"
            strokeWidth={3}
            connectNulls={false}
            dot={{ r: 4, strokeWidth: 0, fill: '#22c55e' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Positive"
        />
        <Line
            type="monotone"
            dataKey="neutral"
            stroke="#64748b"
            strokeWidth={3}
            connectNulls={false}
            dot={{ r: 4, strokeWidth: 0, fill: '#64748b' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Neutral"
        />
        <Line
            type="monotone"
            dataKey="sad"
            stroke="#3b82f6"
            strokeWidth={3}
            connectNulls={false}
            dot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Sad"
        />
        <Line
            type="monotone"
            dataKey="angry"
            stroke="#ef4444"
            strokeWidth={3}
            connectNulls={false}
            dot={{ r: 4, strokeWidth: 0, fill: '#ef4444' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Angry"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};