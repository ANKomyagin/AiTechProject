import React, { useState } from 'react';
import type { HistoryItem } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon'; // Импортируем

interface SidebarProps {
  history: HistoryItem[];
  onNewAnalysis: () => void;
  onSelectHistoryItem: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void; // Добавили тип
  activeId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ history, onNewAnalysis, onSelectHistoryItem, onDelete, activeId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.date.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className={`transition-all duration-300 ease-in-out bg-slate-800/50 border-r border-slate-700 flex flex-col ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && <h1 className="text-xl font-bold text-sky-400">Speech Analyzer</h1>}
        <button onClick={toggleCollapse} className="p-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isCollapsed ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
          </svg>
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={onNewAnalysis}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 rounded-md hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
        >
          <PlusIcon />
          {!isCollapsed && <span>Новый анализ</span>}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-700">
          <input
            type="text"
            placeholder="Поиск по истории..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {filteredHistory.length > 0 ? (
          <ul className="space-y-2">
            {filteredHistory.map(item => (
              <li key={item.id} className="group relative">
                <button
                  onClick={() => onSelectHistoryItem(item.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors pr-10 ${activeId === item.id ? 'bg-sky-900/50' : 'hover:bg-slate-700/70'}`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                    <HistoryIcon />
                    {!isCollapsed && (
                      <div className="ml-3 overflow-hidden">
                        <p className="font-semibold truncate text-slate-100">{item.title}</p>
                        <p className="text-sm text-slate-400 truncate">{item.speaker} - {item.date}</p>
                      </div>
                    )}
                  </div>
                </button>
                
                {/* Кнопка удаления (появляется при наведении) */}
                {!isCollapsed && (
                    <button 
                        onClick={(e) => onDelete(item.id, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Удалить"
                    >
                        <TrashIcon />
                    </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          !isCollapsed && <p className="text-center text-slate-500 p-4">История не найдена.</p>
        )}
      </div>
    </div>
  );
};