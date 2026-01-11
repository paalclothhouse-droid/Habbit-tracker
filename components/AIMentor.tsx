
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
  return (
    <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] rounded-[2rem] p-7 shadow-lg border border-indigo-500/20 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                 <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#1e1b4b] rounded-full"></div>
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tighter uppercase text-indigo-200">AURA</h3>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Architect AI</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">v3.0_LETHAL</span>
          </div>
        </div>

        <div className="min-h-[100px] flex items-center justify-center text-center px-2 mb-8">
          {loading ? (
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          ) : (
            <p className="text-xl font-black text-white uppercase leading-tight tracking-tight drop-shadow-lg">
              {message || "THE PATH IS NARROW. WALK IT OR FALL."}
            </p>
          )}
        </div>

        <button 
          onClick={onConsult}
          disabled={loading}
          className="w-full py-4 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-3 active:scale-[0.97] disabled:opacity-50 text-indigo-200"
        >
          {loading ? (
            <i className="fa-solid fa-circle-notch animate-spin"></i>
          ) : (
            <>
              <i className="fa-solid fa-ghost"></i>
              <span>Summon Truth</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
