
import React, { useState, useEffect, useRef } from 'react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onRename }) => {
  const [deleteStage, setDeleteStage] = useState(0); 
  const timerRef = useRef<number | null>(null);
  
  // IST Date check
  const today = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(new Date());

  const logToday = habit.logs.find(l => l.date === today);
  
  // Logic: Completion is only valid if metric value >= 5 (or not a metric habit)
  const isCompletedToday = !!logToday?.completed && (logToday.value === undefined || logToday.value >= 5);
  const isFailedToday = logToday !== undefined && !isCompletedToday;

  useEffect(() => {
    if (deleteStage > 0) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setDeleteStage(0), 3000);
    }
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [deleteStage]);

  return (
    <div className={`bg-[#0d1117] rounded-[2rem] p-6 border transition-all duration-500 ${
      isCompletedToday 
        ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
        : isFailedToday 
          ? 'border-red-600/60 shadow-[0_0_20px_rgba(220,38,38,0.2)] bg-red-950/20'
          : 'border-slate-800'
    }`}>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ring-1 ring-white/10" style={{ backgroundColor: habit.color }}>
            {habit.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-100 tracking-tight text-lg">{habit.name}</h3>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{habit.category}</p>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); deleteStage < 2 ? setDeleteStage(deleteStage + 1) : onDelete(habit.id); }}
          className={`p-2 rounded-xl transition-all ${deleteStage === 0 ? 'text-slate-700 hover:text-red-500' : 'bg-red-600 text-white text-[10px] font-black'}`}
        >
          {deleteStage === 0 ? <i className="fa-solid fa-trash-can"></i> : deleteStage === 1 ? 'SURE?' : 'KILL'}
        </button>
      </div>
      
      <p className="text-xs text-slate-400 mb-6 italic leading-relaxed h-8 line-clamp-2">
        {habit.description}
      </p>

      {habit.isMetric && logToday && (
        <div className={`mb-4 border p-3 rounded-xl flex justify-between items-center transition-colors duration-500 ${isFailedToday ? 'bg-red-600/30 border-red-500/40' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase ${isFailedToday ? 'text-red-400' : 'text-indigo-400'}`}>
              {isFailedToday ? 'PROTOCOL STATUS: FAILED' : 'PROTOCOL STATUS: SUCCESS'}
            </span>
            {isFailedToday && <span className="text-[8px] text-red-400 font-bold uppercase tracking-tighter mt-0.5">Under 5h Limit</span>}
          </div>
          <span className={`text-sm font-black ${isFailedToday ? 'text-red-400' : 'text-white'}`}>
            {logToday.value} Hours
          </span>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="flex items-center space-x-2">
          <i className={`fa-solid fa-fire text-xs ${isCompletedToday ? 'text-orange-500' : 'text-slate-800'}`}></i>
          <span className={`text-sm font-black ${isCompletedToday ? 'text-slate-100' : 'text-slate-600'}`}>{habit.streak}d</span>
        </div>
        <button
          onClick={() => onToggle(habit.id)}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isCompletedToday 
            ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
            : isFailedToday
              ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse ring-2 ring-red-500/50'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          {isCompletedToday ? 'CONQUERED' : isFailedToday ? 'RE-ATTEMPT' : 'EXECUTE'}
        </button>
      </div>
    </div>
  );
};
