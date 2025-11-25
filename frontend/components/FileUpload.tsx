// frontend/src/components/FileUpload.tsx
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full max-w-2xl p-8 md:p-12 border-2 border-dashed rounded-2xl transition-all duration-300 ${
          isDragging
            ? 'border-sky-400 bg-sky-500/10 scale-[1.02]'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/40'
        }`}
      >
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <div className="bg-sky-500/10 p-4 rounded-full inline-block">
              <UploadIcon />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Загрузите ваше аудио
          </h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto leading-relaxed">
            Перетащите файл сюда или нажмите кнопку ниже. Поддерживаются форматы: MP3, WAV, OGG, MP4.
          </p>

          <div className="mb-8 max-w-2xl mx-auto text-slate-400 leading-relaxed">
            <p className="mb-4">
              Приложение автоматически анализирует выступление: выделяет спикеров, распознаёт эмоции и генерирует
              экспертный отчёт, который поможет улучшить ваш доклад.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mt-4">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-sky-400 flex-shrink-0"></div>
                <span>Работает оффлайн — данные не покидают ваш компьютер</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                <span>Поддержка аудио и видео (MP3, WAV, MP4 и др.)</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-violet-400 flex-shrink-0"></div>
                <span>Визуализация эмоций во времени и сохранение истории</span>
              </div>
            </div>
          </div>
          {/* ↑↑↑ закрыт </div> ↑↑↑ */}

          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            Выбрать файл
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="audio/*,video/*"
            onChange={handleFileChange}
          />
          <div className="mt-6 text-xs text-slate-500">
            🔒 Ваши файлы обрабатываются локально и не покидают компьютер.
          </div>
        </div>
      </div>
    </div>
  );
};