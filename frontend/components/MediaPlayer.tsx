
import React, { useState, useRef, useEffect } from 'react';
import { RangeSlider } from './RangeSlider';

interface MediaPlayerProps {
  fileUrl: string;
  fileType: string;
  onAnalyze: (startTime: number, endTime: number) => void;
  isLoading: boolean;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ fileUrl, fileType, onAnalyze, isLoading }) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const media = mediaRef.current;
    if (media) {
      const setMediaDuration = () => {
          setDuration(media.duration);
          setRange([0, media.duration]);
      };
      const setMediaTime = () => setCurrentTime(media.currentTime);
      
      media.addEventListener('loadedmetadata', setMediaDuration);
      media.addEventListener('timeupdate', setMediaTime);
      media.addEventListener('play', () => setIsPlaying(true));
      media.addEventListener('pause', () => setIsPlaying(false));
      
      // If metadata is already loaded
      if(media.readyState > 0) {
        setMediaDuration();
      }

      return () => {
        media.removeEventListener('loadedmetadata', setMediaDuration);
        media.removeEventListener('timeupdate', setMediaTime);
        media.removeEventListener('play', () => setIsPlaying(true));
        media.removeEventListener('pause', () => setIsPlaying(false));
      };
    }
  }, [fileUrl]);
  
  const handlePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
    }
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4 bg-slate-800/50 rounded-lg">
      <h2 className="text-xl font-semibold text-slate-300">Select a fragment to analyze</h2>
      {fileType.startsWith('video/') ? (
        <video ref={mediaRef as React.RefObject<HTMLVideoElement>} src={fileUrl} controls className="w-full rounded-lg" />
      ) : (
        <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={fileUrl} controls className="w-full" />
      )}
      
      <div className="w-full px-4">
        <RangeSlider
            min={0}
            max={duration}
            values={range}
            onChange={setRange}
            currentTime={currentTime}
        />
        <div className="flex justify-between text-sm text-slate-400 mt-2">
            <span>{formatTime(range[0])}</span>
            <span>{formatTime(range[1])}</span>
        </div>
      </div>

      <button
        onClick={() => onAnalyze(range[0], range[1])}
        disabled={isLoading || duration === 0 || range[1] - range[0] < 1}
        className="px-8 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
            </>
        ) : (
          'Analyze Selected Fragment'
        )}
      </button>
    </div>
  );
};
