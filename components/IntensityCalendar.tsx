
import React from 'react';
import { Habit } from '../types';

interface IntensityCalendarProps {
  habits: Habit[];
}

export const IntensityCalendar: React.FC<IntensityCalendarProps> = ({ habits }) => {
  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const getIntensity = (dayIndex: number) => {
    const now = new Date();
    const dateObj = new Date(now.getFullYear(), now.getMonth(), dayIndex + 1);
    const dateStr = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(dateObj);
    
    if (habits.length === 0) return 0;
    
    // Only count completions where metric is >= 5h (or non-metric)
    const completedCount = habits.filter(h => 
      h.logs.some(l => l.date === dateStr && l.completed && (l.value === undefined || l.value >= 5))
    ).length;
    
    return completedCount / habits.length;
  };

  const days = Array.from({ length: getDaysInMonth() }, (_, i) => i);

  return (
    <div className="bg-[#0d1117] rounded-[2rem] p-8 border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-black text-white/40 text-[10px] uppercase tracking-[0.4em] flex items-center space-x-3">
          <i className="fa-solid fa-calendar-check text-indigo-500"></i>
          <span>Discipline Heatmap (IST)</span>
        </h3>
        <span className="text-[10px] font-black text-slate-700 font-mono">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[9px] font-black text-slate-800 text-center mb-2">{d}</div>
        ))}
        {days.map(day => {
          const intensity = getIntensity(day);
          return (
            <div 
              key={day}
              className="aspect-square rounded-xl border border-white/5 transition-all duration-700 relative group overflow-hidden"
              style={{ 
                backgroundColor: intensity > 0 
                  ? `rgba(79, 70, 229, ${0.1 + intensity * 0.9})` 
                  : 'rgba(255, 255, 255, 0.02)' 
              }}
            >
              {intensity === 1 && (
                <div className="absolute inset-0 bg-indigo-400/10 animate-pulse"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm">
                <span className="text-[10px] font-black text-white">{day + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-10 flex items-center justify-between px-2 pt-6 border-t border-white/5">
        <div className="flex items-center space-x-3">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ghost</span>
          <div className="flex space-x-1.5">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map(lvl => (
              <div key={lvl} className="w-3.5 h-3.5 rounded-[4px] ring-1 ring-white/5" style={{ backgroundColor: `rgba(99, 102, 241, ${lvl})` }}></div>
            ))}
          </div>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Hardened</span>
        </div>
        <div className="flex items-center space-x-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[9px] font-black text-slate-500 uppercase">Delhi Synced</span>
        </div>
      </div>
    </div>
  );
};
