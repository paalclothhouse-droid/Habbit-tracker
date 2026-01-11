
import React from 'react';
import { AIInsight } from '../types';

interface AIPanelProps {
  insight: AIInsight | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ insight, loading, onRefresh }) => {
  return (
    <div className="bg-[#0b101a] rounded-[2rem] p-7 shadow-xl relative overflow-hidden border border-slate-800/60">
      <div className="absolute top-0 right-0 p-8 opacity-5 grayscale">
         <i className="fa-solid fa-brain text-9xl text-slate-500"></i>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-indigo-500/20">Coach Module</span>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Intelligence</h2>
          </div>
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-xl transition-all disabled:opacity-30 border border-slate-700 text-slate-400"
          >
            <i className={`fa-solid fa-rotate-right text-xs ${loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-slate-800 rounded-xl w-3/4"></div>
            <div className="h-4 bg-slate-800/50 rounded-xl w-full"></div>
            <div className="h-4 bg-slate-800/50 rounded-xl w-5/6"></div>
          </div>
        ) : insight ? (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{insight.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">
              {insight.advice}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {insight.tags.map(tag => (
                <span key={tag} className="bg-slate-800/50 border border-slate-700 text-slate-300 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-600 italic text-sm py-4">Track more data to initiate cognitive analysis.</p>
        )}
      </div>
    </div>
  );
};
