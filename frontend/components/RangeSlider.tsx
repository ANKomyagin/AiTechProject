
import React, { useRef, useCallback } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  values: [number, number];
  onChange: (values: [number, number]) => void;
  currentTime: number;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, values, onChange, currentTime }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const activeThumb = useRef<'min' | 'max' | null>(null);

  const getPercentage = (value: number) => (max > min ? ((value - min) / (max - min)) * 100 : 0);
  const getValue = (percentage: number) => ((max - min) * percentage) / 100 + min;

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!activeThumb.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const newValue = getValue(percent);

    if (activeThumb.current === 'min') {
      onChange([Math.min(newValue, values[1]), values[1]]);
    } else {
      onChange([values[0], Math.max(newValue, values[0])]);
    }
  }, [onChange, values, min, max]);

  const handleMouseUp = useCallback(() => {
    activeThumb.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  const handleMouseDown = (thumb: 'min' | 'max') => {
    activeThumb.current = thumb;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const minPercent = getPercentage(values[0]);
  const maxPercent = getPercentage(values[1]);
  const currentPercent = getPercentage(currentTime);

  return (
    <div ref={sliderRef} className="relative w-full h-4 flex items-center">
        {/* Track */}
        <div className="relative w-full h-1 bg-slate-600 rounded-full">
            {/* Selected Range */}
            <div className="absolute h-1 bg-sky-500 rounded-full" style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}></div>
            
            {/* Current Time Indicator */}
            <div className="absolute -top-1 w-1 h-3 bg-red-500 rounded-full" style={{ left: `${currentPercent}%` }}></div>

            {/* Min Thumb */}
            <div onMouseDown={() => handleMouseDown('min')} className="absolute w-4 h-4 bg-white rounded-full shadow-md cursor-pointer -top-1.5" style={{ left: `${minPercent}%`, transform: 'translateX(-50%)' }}></div>
            
            {/* Max Thumb */}
            <div onMouseDown={() => handleMouseDown('max')} className="absolute w-4 h-4 bg-white rounded-full shadow-md cursor-pointer -top-1.5" style={{ left: `${maxPercent}%`, transform: 'translateX(-50%)' }}></div>
        </div>
    </div>
  );
};
