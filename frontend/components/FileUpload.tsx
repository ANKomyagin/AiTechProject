
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full max-w-2xl p-10 border-2 border-dashed rounded-xl transition-colors ${isDragging ? 'border-sky-500 bg-slate-800/50' : 'border-slate-700 hover:border-slate-600'}`}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <UploadIcon />
          </div>
          <h2 className="text-2xl font-bold mb-2">Upload your Audio/Video File</h2>
          <p className="text-slate-400 mb-6">Drag and drop a file here, or click to select a file.</p>
          <label htmlFor="file-upload" className="cursor-pointer inline-block px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors">
            Select File
          </label>
          <input id="file-upload" type="file" className="hidden" accept="audio/*,video/*" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
};
