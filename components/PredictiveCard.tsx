
import React from 'react';
import { AIPrediction } from '../types';

interface PredictiveCardProps {
  prediction: AIPrediction | null;
  loading: boolean;
}

export const PredictiveCard: React.FC<PredictiveCardProps> = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-50 rounded"></div>
          <div className="h-10 bg-slate-50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4">
        <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter animate-pulse">
          Future Forecast
        </div>
      </div>
      
      <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
        <i className="fa-solid fa-crystal-ball text-indigo-500"></i>
        <span>AI Predictions</span>
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Projected Lvl</p>
          <p className="text-2xl font-black text-indigo-600">{prediction.projectedLevel}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Success Prob.</p>
          <p className="text-2xl font-black text-emerald-600">{prediction.successProbability}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start space-x-3 text-sm">
          <i className="fa-solid fa-calendar-star text-indigo-400 mt-1"></i>
          <div>
            <p className="font-bold text-slate-700">Next Milestone</p>
            <p className="text-slate-500 text-xs">{prediction.nextMilestoneEstimate}</p>
          </div>
        </div>
        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
          <p className="text-xs text-indigo-800 leading-relaxed italic">
            "{prediction.summary}"
          </p>
        </div>
      </div>
    </div>
  );
};
