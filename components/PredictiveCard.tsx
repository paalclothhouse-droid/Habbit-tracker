
import React from 'react';
import { AIPrediction } from '../types';

interface PredictiveCardProps {
  prediction: AIPrediction | null;
  loading: boolean;
}

export const PredictiveCard: React.FC<PredictiveCardProps> = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#0b101a] rounded-[2rem] p-7 border border-slate-800/60 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-16 bg-slate-800/50 rounded-2xl"></div>
          <div className="h-16 bg-slate-800/50 rounded-2xl"></div>
        </div>
        <div className="h-20 bg-slate-800/50 rounded-2xl"></div>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className="bg-[#0b101a] rounded-[2rem] p-7 border border-slate-800/60 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-5">
        <div className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-emerald-500/20">
          Live Model
        </div>
      </div>
      
      <h3 className="font-black text-slate-300 text-xs uppercase tracking-[0.3em] mb-8 flex items-center space-x-3">
        <i className="fa-solid fa-chart-line text-indigo-500"></i>
        <span>Projected Trajectory</span>
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#05070a] p-4 rounded-[1.5rem] border border-slate-800">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expected Lvl</p>
          <p className="text-3xl font-black text-white">{prediction.projectedLevel}</p>
        </div>
        <div className="bg-[#05070a] p-4 rounded-[1.5rem] border border-slate-800">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Success Rate</p>
          <p className="text-3xl font-black text-emerald-400">{prediction.successProbability}%</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-4 text-sm">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
             <i className="fa-solid fa-flag-checkered text-slate-400 text-xs"></i>
          </div>
          <div>
            <p className="font-black text-slate-500 text-[10px] uppercase tracking-widest">Next Milestone</p>
            <p className="text-slate-200 text-xs mt-1">{prediction.nextMilestoneEstimate}</p>
          </div>
        </div>
        <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            >> {prediction.summary}
          </p>
        </div>
      </div>
    </div>
  );
};
