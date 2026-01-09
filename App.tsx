
import React, { useState, useEffect, useCallback } from 'react';
import { Habit, AIInsight, Frequency, Reminder, UserProfile, AIPrediction } from './types';
import { HabitCard } from './components/HabitCard';
import { AIPanel } from './components/AIPanel';
import { AIMentor } from './components/AIMentor';
import { PredictiveCard } from './components/PredictiveCard';
import { getAIHabitInsights, suggestNewHabit, getMentorMotivation, predictFutureResults } from './services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const INITIAL_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Morning Meditation',
    description: '10 minutes of mindfulness to start the day focused.',
    category: 'Wellness',
    frequency: Frequency.DAILY,
    streak: 5,
    logs: [{ date: new Date().toISOString().split('T')[0], completed: false }],
    reminders: [{ id: 'r1', time: '07:30', days: [1, 2, 3, 4, 5], enabled: true }],
    createdAt: new Date().toISOString(),
    color: '#6366f1'
  }
];

const INITIAL_USER: UserProfile = {
  id: 'user_' + Math.random().toString(36).substr(2, 9),
  name: 'Habit Explorer',
  xp: 0,
  level: 1,
  joinedAt: new Date().toISOString(),
  streakFreezes: 1
};

const XP_PER_HABIT = 50;
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habitquest_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('habitquest_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });
  
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [mentorMessage, setMentorMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitGoal, setNewHabitGoal] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderDays, setReminderDays] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    localStorage.setItem('habitquest_habits', JSON.stringify(habits));
    localStorage.setItem('habitquest_user', JSON.stringify(user));
  }, [habits, user]);

  const fetchInsightsAndPredictions = useCallback(async () => {
    if (habits.length === 0) return;
    setIsAiLoading(true);
    setIsPredicting(true);
    try {
      const [insight, forecast] = await Promise.all([
        getAIHabitInsights(habits),
        predictFutureResults(user, habits)
      ]);
      setAiInsight(insight);
      setPrediction(forecast);
    } catch (err) {
      console.error("AI Data fetch error", err);
    } finally {
      setIsAiLoading(false);
      setIsPredicting(false);
    }
  }, [habits, user]);

  const handleConsultMentor = async () => {
    setIsMentorLoading(true);
    try {
      const msg = await getMentorMotivation(user, habits, prediction || undefined);
      setMentorMessage(msg);
    } catch (err) {
      console.error("Mentor error", err);
    } finally {
      setIsMentorLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsAndPredictions();
    if (!mentorMessage) {
      handleConsultMentor();
    }
  }, [fetchInsightsAndPredictions]);

  const handleToggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    let xpGained = 0;

    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit;
      const alreadyLogged = habit.logs.find(l => l.date === today);
      let newLogs;
      let newStreak = habit.streak;

      if (alreadyLogged) {
        newLogs = habit.logs.filter(l => l.date !== today);
        newStreak = Math.max(0, habit.streak - 1);
        xpGained -= XP_PER_HABIT;
      } else {
        newLogs = [...habit.logs, { date: today, completed: true }];
        newStreak = habit.streak + 1;
        xpGained += XP_PER_HABIT;
      }
      return { ...habit, logs: newLogs, streak: newStreak };
    }));

    setUser(prev => {
      const newXp = Math.max(0, prev.xp + xpGained);
      const newLevel = Math.floor(newXp / 500) + 1;
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const handleRenameHabit = (id: string, newName: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name: newName } : h));
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleAISuggestion = async () => {
    if (!newHabitGoal) return;
    setIsSuggesting(true);
    try {
      const suggested = await suggestNewHabit(newHabitGoal);
      const newHabit: Habit = {
        id: Math.random().toString(36).substr(2, 9),
        name: suggested.name || 'New Habit',
        description: suggested.description || '',
        category: suggested.category || 'General',
        frequency: Frequency.DAILY,
        streak: 0,
        logs: [],
        reminders: [{
          id: Math.random().toString(36).substr(2, 5),
          time: reminderTime,
          days: reminderDays,
          enabled: true
        }],
        createdAt: new Date().toISOString(),
        color: suggested.color || '#6366f1'
      };
      setHabits(prev => [newHabit, ...prev]);
      setShowAddModal(false);
      setNewHabitGoal('');
      setUser(prev => ({ ...prev, xp: prev.xp + 25 }));
    } catch (err) {
      console.error("Suggestion error", err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const xpProgress = (user.xp % 500) / 5;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-200 ring-4 ring-indigo-50">
            {user.level}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Level {user.level} <span className="text-indigo-600 font-medium text-lg ml-2">{user.name}</span>
            </h1>
            <div className="flex items-center space-x-3 mt-1 w-48 md:w-64">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${xpProgress}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{user.xp % 500} / 500 XP</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center space-x-2"
        >
          <i className="fa-solid fa-plus"></i>
          <span>New Habit</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Habits', value: habits.length, icon: 'fa-list-check', color: 'bg-blue-50 text-blue-600' },
              { label: 'Total XP', value: user.xp, icon: 'fa-star', color: 'bg-yellow-50 text-yellow-600' },
              { label: 'Freezes', value: user.streakFreezes, icon: 'fa-snowflake', color: 'bg-cyan-50 text-cyan-600' },
              { label: 'Rank', value: user.level > 5 ? 'Adept' : 'Novice', icon: 'fa-shield-halved', color: 'bg-purple-50 text-purple-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3 hover:border-indigo-100 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {habits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onToggle={handleToggleHabit} 
                onDelete={handleDeleteHabit}
                onRename={handleRenameHabit}
              />
            ))}
            {habits.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <i className="fa-solid fa-seedling text-4xl text-slate-200 mb-4"></i>
                <p className="text-slate-400 font-medium">No habits yet. Plant the seeds of success!</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <AIMentor 
            user={user} 
            habits={habits} 
            loading={isMentorLoading} 
            message={mentorMessage} 
            onConsult={handleConsultMentor} 
          />

          <PredictiveCard 
            prediction={prediction} 
            loading={isPredicting} 
          />
          
          <AIPanel 
            insight={aiInsight} 
            loading={isAiLoading} 
            onRefresh={fetchInsightsAndPredictions} 
          />
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
               <i className="fa-solid fa-trophy text-yellow-500"></i>
               <span>Mastery Track</span>
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Habit Architect', desc: 'Create 5 custom habits', progress: (habits.length / 5) * 100, icon: 'fa-compass-drafting' },
                { title: 'Streak Master', desc: 'Reach a 10-day streak', progress: Math.min((Math.max(...habits.map(h => h.streak), 0) / 10) * 100, 100), icon: 'fa-bolt-lightning' },
                { title: 'XP Collector', desc: 'Reach 1000 Total XP', progress: Math.min((user.xp / 1000) * 100, 100), icon: 'fa-gem' },
              ].map((m, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                        <i className={`fa-solid ${m.icon}`}></i>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{m.title}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{Math.round(m.progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-1000" 
                      style={{ width: `${m.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center p-8 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Setup New Habit</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="px-8 pb-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">AI Goal Definition</label>
                <textarea 
                  value={newHabitGoal}
                  onChange={(e) => setNewHabitGoal(e.target.value)}
                  placeholder="E.g. Clear my backlogs, drink more water, or start running."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]"
                ></textarea>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center">
                  <i className="fa-solid fa-bell text-indigo-500 mr-2"></i>
                  Custom Reminders
                </label>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium">Daily Alert Time</p>
                    <input 
                      type="time" 
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    />
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium">Active Days</p>
                    <div className="flex justify-between">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setReminderDays(prev => 
                              prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort()
                            );
                          }}
                          className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                            reminderDays.includes(idx)
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110'
                            : 'bg-white text-slate-400 border border-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAISuggestion}
                disabled={!newHabitGoal || isSuggesting}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSuggesting ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    <span>Optimizing Habit...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-magic-wand-sparkles"></i>
                    <span>Generate & Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
