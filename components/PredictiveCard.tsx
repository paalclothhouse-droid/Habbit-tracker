
import React from 'react';
import { AIPrediction } from '../types';

interface PredictiveCardProps {
  prediction: AIPrediction | null;
  loading: boolean;
}

export const PredictiveCard: React.FC<PredictiveCardProps> = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#0d1117] rounded-[2rem] p-7 border border-slate-800 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-16 bg-white/5 rounded-2xl"></div>
          <div className="h-16 bg-white/5 rounded-2xl"></div>
        </div>
        <div className="h-20 bg-white/5 rounded-2xl"></div>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className="bg-[#0d1117] rounded-[2rem] p-7 border border-indigo-900/30 relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-5">
        <div className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-indigo-500/20 animate-pulse">
          Oracle Link
        </div>
      </div>
      
      <h3 className="font-black text-white text-xs uppercase tracking-[0.3em] mb-8 flex items-center space-x-3">
        <i className="fa-solid fa-crystal-ball text-indigo-400"></i>
        <span>Future Projection</span>
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/40 p-4 rounded-[1.5rem] border border-white/5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Lv.</p>
          <p className="text-3xl font-black text-indigo-400">{prediction.projectedLevel}</p>
        </div>
        <div className="bg-black/40 p-4 rounded-[1.5rem] border border-white/5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Stability</p>
          <p className="text-3xl font-black text-emerald-400">{prediction.successProbability}%</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-4 text-sm">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
             <i className="fa-solid fa-calendar-star text-indigo-400 text-xs"></i>
          </div>
          <div>
            <p className="font-black text-slate-300 text-[10px] uppercase tracking-widest">Next Milestone</p>
            <p className="text-slate-500 text-xs mt-1">{prediction.nextMilestoneEstimate}</p>
          </div>
        </div>
        <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
          <p className="text-xs text-indigo-200/70 leading-relaxed italic font-medium">
            "{prediction.summary}"
          </p>
        </div>
      </div>
    </div>
  );
};
