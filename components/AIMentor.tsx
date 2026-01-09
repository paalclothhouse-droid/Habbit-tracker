
import React from 'react';
import { UserProfile, Habit } from '../types';

interface AIMentorProps {
  user: UserProfile;
  habits: Habit[];
  onConsult: () => void;
  loading: boolean;
  message: string;
}

export const AIMentor: React.FC<AIMentorProps> = ({ user, habits, onConsult, loading, message }) => {
  const isHarsh = message.length > 0;

  return (
    <div className={`bg-gradient-to-br ${isHarsh ? 'from-slate-950 to-red-950' : 'from-slate-900 to-indigo-950'} text-white rounded-3xl p-6 shadow-2xl border ${isHarsh ? 'border-red-500/20' : 'border-white/10'} relative overflow-hidden group transition-colors duration-700`}>
      {/* Background decoration */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${isHarsh ? 'bg-red-500/10' : 'bg-indigo-500/20'} rounded-full blur-3xl transition-colors duration-700`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${isHarsh ? 'from-red-600 to-orange-400' : 'from-indigo-500 to-purple-400'} flex items-center justify-center shadow-lg border-2 border-white/20 transition-all duration-700`}>
              <i className={`fa-solid ${isHarsh ? 'fa-eye' : 'fa-sparkles'} text-xl text-white`}></i>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${isHarsh ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-green-500'} border-2 border-slate-900 rounded-full animate-pulse`}></div>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Aura</h3>
            <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Reality Check Engine</p>
          </div>
        </div>

        <div className="min-h-[100px] mb-6">
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded w-full animate-pulse"></div>
              <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse"></div>
              <div className="h-3 bg-white/10 rounded w-4/6 animate-pulse"></div>
            </div>
          ) : (
            <div className="relative">
              <i className="fa-solid fa-quote-left absolute -top-2 -left-4 text-white/10 text-3xl"></i>
              <p className="text-sm leading-relaxed text-slate-200 font-medium italic">
                {message || `The path to Level ${user.level + 1} is paved with discipline, not excuses. What's it going to be today?`}
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={onConsult}
          disabled={loading}
          className={`w-full py-3 ${isHarsh ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-white/10 hover:bg-white/20'} border ${isHarsh ? 'border-red-500/30' : 'border-white/10'} rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50`}
        >
          {loading ? (
            <i className="fa-solid fa-circle-notch animate-spin"></i>
          ) : (
            <>
              <i className="fa-solid fa-skull text-[10px]"></i>
              <span>Face Reality</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
