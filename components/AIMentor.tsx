
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
  // Enhanced detection for the punchier personality
  const isHarsh = /burn|kill|nail|coffin|soft|weak|fail|die|blood|blade|shatter/i.test(message);
  const isDivine = /sun|reset|god|titan|forgive|eternal|rising|shine|star|light/i.test(message);

  let containerClass = "from-slate-900 to-indigo-950 border-white/10";
  let iconClass = "from-indigo-500 to-purple-400";
  let pulseClass = "bg-green-500";
  let iconName = "fa-sparkles";
  let label = "Architect AI";
  let labelClass = "text-indigo-400";

  if (isHarsh) {
    containerClass = "from-black via-red-950 to-slate-900 border-red-900/40";
    iconClass = "from-red-600 to-black shadow-[0_0_20px_rgba(220,38,38,0.3)]";
    pulseClass = "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,1)]";
    iconName = "fa-bolt-lightning";
    label = "Executioner Mode";
    labelClass = "text-red-500";
  } else if (isDivine) {
    containerClass = "from-slate-900 via-amber-950/30 to-black border-amber-600/30";
    iconClass = "from-amber-400 to-white shadow-[0_0_20px_rgba(251,191,36,0.3)]";
    pulseClass = "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)]";
    iconName = "fa-sun";
    label = "Solar Oracle";
    labelClass = "text-amber-400";
  }

  return (
    <div className={`bg-gradient-to-br ${containerClass} text-white rounded-[2rem] p-7 shadow-2xl border relative overflow-hidden group transition-all duration-1000`}>
      {/* Visual aura effect */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 opacity-20 rounded-full blur-3xl transition-colors duration-1000 ${isHarsh ? 'bg-red-600' : isDivine ? 'bg-amber-400' : 'bg-indigo-600'}`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${iconClass} flex items-center justify-center border border-white/10 transition-all duration-1000 rotate-3 group-hover:rotate-0`}>
                <i className={`fa-solid ${iconName} text-lg text-white`}></i>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${pulseClass} border-2 border-slate-950 rounded-full animate-pulse`}></div>
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tighter uppercase opacity-50">Aura</h3>
              <p className={`text-[10px] ${labelClass} font-black uppercase tracking-[0.2em]`}>{label}</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">v3.0_Lethal</span>
          </div>
        </div>

        <div className="min-h-[120px] flex items-center justify-center text-center px-2 mb-8">
          {loading ? (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          ) : (
            <div className="relative">
              <p className={`text-xl md:text-2xl leading-tight tracking-tight font-black uppercase ${isDivine ? 'text-amber-200' : isHarsh ? 'text-white' : 'text-slate-200'}`}>
                {message || "The path is narrow. Walk it or fall."}
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={onConsult}
          disabled={loading}
          className={`w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-3 active:scale-[0.97] disabled:opacity-30`}
        >
          {loading ? (
            <i className="fa-solid fa-circle-notch animate-spin"></i>
          ) : (
            <>
              <i className="fa-solid fa-ghost opacity-50"></i>
              <span>Summon Truth</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
