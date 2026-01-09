
import React, { useState } from 'react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(habit.name);
  
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.logs.some(l => l.date === today && l.completed);
  const activeReminders = habit.reminders?.filter(r => r.enabled) || [];

  const handleSave = () => {
    if (editedName.trim()) {
      onRename(habit.id, editedName.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditedName(habit.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md group relative flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3 w-full mr-2 overflow-hidden">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
            style={{ backgroundColor: habit.color }}
          >
            {habit.name.charAt(0).toUpperCase()}
          </div>
          
          {isEditing ? (
            <div className="flex-1 flex items-center space-x-2">
              <input
                autoFocus
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-50 border border-indigo-300 rounded-lg px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSave}
                className="text-green-600 hover:text-green-700 p-1"
                title="Save"
              >
                <i className="fa-solid fa-check"></i>
              </button>
            </div>
          ) : (
            <div className="overflow-hidden cursor-pointer group/name flex items-center space-x-2" onClick={() => setIsEditing(true)}>
              <h3 className="font-semibold text-slate-800 truncate">{habit.name}</h3>
              <i className="fa-solid fa-pen text-[10px] text-slate-300 opacity-0 group-hover/name:opacity-100 transition-opacity"></i>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 shrink-0">
          {!isEditing && (
            <button 
              onClick={() => onDelete(habit.id)}
              className="text-slate-300 hover:text-red-500 transition-colors p-1"
              aria-label="Delete habit"
            >
              <i className="fa-solid fa-trash-can text-sm"></i>
            </button>
          )}
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px] italic">
        {habit.category} • {habit.description}
      </p>

      {/* Reminders Row */}
      {activeReminders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeReminders.slice(0, 2).map(r => (
            <div key={r.id} className="flex items-center space-x-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
              <i className="fa-regular fa-clock text-[10px] text-indigo-500"></i>
              <span className="text-[10px] font-medium text-slate-600">{r.time}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-fire text-orange-500"></i>
          <span className="text-sm font-bold text-slate-700">{habit.streak}d</span>
        </div>
        <button
          onClick={() => onToggle(habit.id)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            isCompletedToday 
            ? 'bg-green-50 text-green-600 border border-green-100' 
            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {isCompletedToday ? (
            <span className="flex items-center space-x-1">
              <i className="fa-solid fa-check"></i>
              <span>Done</span>
            </span>
          ) : 'Complete'}
        </button>
      </div>
    </div>
  );
};
