
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
    <div className="bg-[#0b101a] rounded-[2rem] p-8 border border-slate-800/60 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.4em] flex items-center space-x-3">
          <i className="fa-solid fa-layer-group text-indigo-500"></i>
          <span>Consistency Grid</span>
        </h3>
        <span className="text-[10px] font-bold text-slate-600 font-mono">
          {new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-7 gap-3 relative z-10">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[9px] font-bold text-slate-700 text-center mb-2">{d}</div>
        ))}
        {days.map(day => {
          const intensity = getIntensity(day);
          return (
            <div 
              key={day}
              className="aspect-square rounded-lg border border-slate-800/50 transition-all duration-300 relative group overflow-hidden"
              style={{ 
                backgroundColor: intensity > 0 
                  ? `rgba(99, 102, 241, ${0.1 + intensity * 0.5})` 
                  : 'transparent' 
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-white">{day + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-10 flex items-center justify-between px-2 pt-6 border-t border-slate-800/50 relative z-10">
        <div className="flex items-center space-x-3">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Idle</span>
          <div className="flex space-x-1.5">
            {[0.2, 0.4, 0.6, 0.8, 1].map(lvl => (
              <div key={lvl} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: `rgba(99, 102, 241, ${lvl})` }}></div>
            ))}
          </div>
          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Max</span>
        </div>
      </div>
    </div>
  );
};
