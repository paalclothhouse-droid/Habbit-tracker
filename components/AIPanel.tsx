
import React, { useState } from 'react';
import { AIInsight } from '../types';

interface AIPanelProps {
  insight: AIInsight | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ insight, loading, onRefresh }) => {
  return (
    <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <i className="fa-solid fa-brain text-8xl"></i>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">AI Coach</span>
            <h2 className="text-xl font-bold">Smart Insights</h2>
          </div>
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <i className={`fa-solid fa-arrows-rotate ${loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-full"></div>
            <div className="h-4 bg-white/20 rounded w-5/6"></div>
          </div>
        ) : insight ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-200">{insight.title}</h3>
            <p className="text-indigo-50/80 leading-relaxed text-sm">
              {insight.advice}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {insight.tags.map(tag => (
                <span key={tag} className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-indigo-200/60 italic">Track a few habits to unlock AI coaching insights.</p>
        )}
      </div>
    </div>
  );
};
