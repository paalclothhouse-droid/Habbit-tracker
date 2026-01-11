
import React, { useState, useEffect } from 'react';

interface HabitTimerProps {
  habitName: string;
}

export const HabitTimer: React.FC<HabitTimerProps> = ({ habitName }) => {
  // Default to 45 minutes (2700 seconds) for a solid study block
  const [timeLeft, setTimeLeft] = useState(2700); 
  const [isActive, setIsActive] = useState(false);
  const [isSetup, setIsSetup] = useState(true);
  const [selectedMinutes, setSelectedMinutes] = useState(45);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setTimeLeft(selectedMinutes * 60);
    setIsSetup(false);
    setIsActive(true);
  };

  if (isSetup) {
    return (
      <div className="mt-4 bg-black/40 rounded-xl p-4 border border-slate-800">
        <div className="flex justify-between items-center mb-4">
           <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Configure Timer</span>
           <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Volatile Memory</span>
        </div>
        <div className="flex justify-between items-center gap-2">
           <div className="flex gap-2">
             {[25, 45, 60].map(m => (
               <button 
                 key={m}
                 onClick={() => setSelectedMinutes(m)}
                 className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${selectedMinutes === m ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'}`}
               >
                 {m}m
               </button>
             ))}
           </div>
           <button 
             onClick={startSession}
             className="flex-1 bg-white text-black py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-200"
           >
             Start
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-[#05070a] rounded-xl p-5 border border-indigo-500/30 relative overflow-hidden">
      {/* Scanline effect for that advanced look */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>
      
      <div className="flex justify-between items-center mb-2 relative z-10">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] animate-pulse">
           {isActive ? '● SYSTEM ACTIVE' : '○ PAUSED'}
        </span>
        <button 
          onClick={() => { setIsActive(false); setIsSetup(true); }} 
          className="text-slate-600 hover:text-red-400 transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="text-center py-4 relative z-10">
        <div className="text-5xl font-black text-white font-mono tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          {formatTime(timeLeft)}
        </div>
        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Remaining</div>
      </div>

      <div className="flex gap-3 relative z-10">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-xs transition-all border ${
            isActive 
              ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20' 
              : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          }`}
        >
          {isActive ? <><i className="fa-solid fa-pause mr-2"></i>Halt</> : <><i className="fa-solid fa-play mr-2"></i>Resume</>}
        </button>
      </div>
      
      <div className="mt-3 text-center">
         <p className="text-[8px] text-slate-700 uppercase tracking-widest">
           Warning: Closing uplink (app) terminates session.
         </p>
      </div>
    </div>
  );
};
