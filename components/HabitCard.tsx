
import React, { useState, useEffect, useRef } from 'react';
import { Habit } from '../types';
import { HabitTimer } from './HabitTimer';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onRename }) => {
  const [deleteStage, setDeleteStage] = useState(0); 
  const [showTimer, setShowTimer] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  // Check if habit is related to study/practice/test
  const isFocusHabit = /study|practice|test|code|learn|work/i.test(habit.name) || /study|practice|test/i.test(habit.category);

  // Local Date check (YYYY-MM-DD for log matching)
  const today = new Intl.DateTimeFormat('en-CA', { 
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
    <div className={`rounded-[2rem] p-6 border transition-all duration-500 relative overflow-hidden group ${
      isCompletedToday 
        ? 'bg-[#0f172a] border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
        : isFailedToday 
          ? 'bg-[#1a0505] border-red-900/60 shadow-[0_0_20px_rgba(153,27,27,0.2)]'
          : 'bg-[#0b101a] border-slate-800/60 hover:border-indigo-500/40'
    }`}>
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-lg ring-1 ring-white/5" style={{ background: habit.color || '#4f46e5' }}>
            <span className="text-lg">{habit.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-bold text-white tracking-tight text-lg">{habit.name}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{habit.category}</p>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); deleteStage < 2 ? setDeleteStage(deleteStage + 1) : onDelete(habit.id); }}
          className={`p-2 rounded-xl transition-all ${deleteStage === 0 ? 'text-slate-700 hover:text-red-500' : 'bg-red-900/80 text-white text-[10px] font-black'}`}
        >
          {deleteStage === 0 ? <i className="fa-solid fa-trash-can"></i> : deleteStage === 1 ? 'DEL?' : 'CONFIRM'}
        </button>
      </div>
      
      <p className="text-xs text-slate-400 mb-6 leading-relaxed h-8 line-clamp-2 relative z-10">
        {habit.description}
      </p>

      {habit.isMetric && logToday && (
        <div className={`mb-4 border p-3 rounded-xl flex justify-between items-center transition-colors duration-500 relative z-10 ${isFailedToday ? 'bg-red-950/30 border-red-900/30' : 'bg-slate-900/50 border-slate-800'}`}>
          <div className="flex flex-col">
            <span className={`text-[9px] font-black uppercase tracking-widest ${isFailedToday ? 'text-red-500' : 'text-emerald-500'}`}>
              {isFailedToday ? 'THRESHOLD MISSED' : 'TARGET MET'}
            </span>
          </div>
          <span className={`text-sm font-black ${isFailedToday ? 'text-red-400' : 'text-emerald-400'}`}>
            {logToday.value} Hours
          </span>
        </div>
      )}

      {/* Focus Timer Trigger */}
      {isFocusHabit && !showTimer && !isCompletedToday && !isFailedToday && (
        <button 
          onClick={() => setShowTimer(true)}
          className="w-full mb-4 py-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-indigo-300 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-900/30 transition-all flex items-center justify-center space-x-2"
        >
          <i className="fa-solid fa-stopwatch"></i>
          <span>Initialize Timer</span>
        </button>
      )}

      {/* The Actual Timer Component */}
      {showTimer && (
        <div className="mb-4">
          <HabitTimer habitName={habit.name} />
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-slate-800/50 relative z-10">
        <div className="flex items-center space-x-2">
          <i className={`fa-solid fa-bolt text-xs ${isCompletedToday ? 'text-emerald-400' : 'text-slate-600'}`}></i>
          <span className={`text-sm font-black ${isCompletedToday ? 'text-emerald-400' : 'text-slate-500'}`}>{habit.streak} Days</span>
        </div>
        <button
          onClick={() => onToggle(habit.id)}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
            isCompletedToday 
            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
            : isFailedToday
              ? 'bg-red-900/20 border-red-600 text-red-200'
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
          }`}
        >
          {isCompletedToday ? 'COMPLETE' : isFailedToday ? 'FAILED' : 'LOG'}
        </button>
      </div>
    </div>
  );
};
