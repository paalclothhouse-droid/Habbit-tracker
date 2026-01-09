
import React from 'react';
import { AIInsight } from '../types';

interface AIPanelProps {
  insight: AIInsight | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ insight, loading, onRefresh }) => {
  return (
    <div className="bg-gradient-to-b from-[#0d1117] to-black text-white rounded-[2rem] p-7 shadow-2xl relative overflow-hidden border border-slate-800">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <i className="fa-solid fa-brain text-9xl"></i>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <span className="bg-indigo-600/20 text-indigo-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-indigo-600/30">Coach Module</span>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/60">Intelligence</h2>
          </div>
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 border border-white/5"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs ${loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-white/5 rounded-xl w-3/4"></div>
            <div className="h-4 bg-white/5 rounded-xl w-full"></div>
            <div className="h-4 bg-white/5 rounded-xl w-5/6"></div>
          </div>
        ) : insight ? (
          <div className="space-y-5">
            <h3 className="text-xl font-black text-white tracking-tight leading-tight">{insight.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">
              {insight.advice}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {insight.tags.map(tag => (
                <span key={tag} className="bg-white/5 border border-white/5 text-slate-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
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
