
import React, { useState, useEffect, useCallback } from 'react';
import { Habit, AIInsight, Frequency, UserProfile, AIPrediction } from './types';
import { HabitCard } from './components/HabitCard';
import { AIPanel } from './components/AIPanel';
import { AIMentor } from './components/AIMentor';
import { PredictiveCard } from './components/PredictiveCard';
import { IntensityCalendar } from './components/IntensityCalendar';
import { getAIHabitInsights, suggestNewHabit, getMentorMotivation, predictFutureResults } from './services/geminiService';

const STORAGE_KEYS = {
  HABITS: 'hq_habits_v9',
  USER: 'hq_user_v9',
  TOKEN: 'hq_session_token_v9'
};

// Helper to get current date in Delhi Timezone
const getDelhiDate = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
};

const INITIAL_HABITS: Habit[] = [
  {
    id: 'sleep-1',
    name: 'Sleep',
    description: 'Biological reset. < 5h = FAILURE.',
    category: 'Bio-Sync',
    frequency: Frequency.DAILY,
    streak: 0,
    logs: [],
    reminders: [],
    createdAt: new Date().toISOString(),
    color: '#3b82f6',
    isMetric: true
  },
  {
    id: 'study-1',
    name: 'Study',
    description: 'Cognitive load. < 5h = FAILURE.',
    category: 'Cognitive',
    frequency: Frequency.DAILY,
    streak: 0,
    logs: [],
    reminders: [],
    createdAt: new Date().toISOString(),
    color: '#a855f7',
    isMetric: true
  }
];

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) return JSON.parse(saved);
    return {
      id: 'aura_' + Math.random().toString(36).substr(2, 15),
      name: 'Void Walker',
      xp: 0,
      level: 1,
      joinedAt: new Date().toISOString(),
      streakFreezes: 1
    };
  });
  
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [mentorMessage, setMentorMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectionModal, setSelectionModal] = useState<{show: boolean, habitId: string, name: string} | null>(null);
  const [newHabitGoal, setNewHabitGoal] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [habits, user]);

  const calculateStreak = (logs: {date: string, completed: boolean, value?: number}[]) => {
    if (!logs || logs.length === 0) return 0;
    const completedDates = new Set(
      logs.filter(l => l.completed && (l.value === undefined || l.value >= 5)).map(l => l.date)
    );
    let streak = 0;
    let checkDate = new Date();
    // Use Delhi date for streak calculation
    let checkDateStr = getDelhiDate();
    
    if (!completedDates.has(checkDateStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(checkDate);
    }
    while (completedDates.has(checkDateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(checkDate);
    }
    return streak;
  };

  const handleToggleHabit = (id: string, value: number) => {
    const today = getDelhiDate();
    let xpGained = 0;

    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit;
      const isMetricallyComplete = value >= 5;
      const alreadyLogged = habit.logs.find(l => l.date === today);
      let newLogs;

      if (alreadyLogged) {
        newLogs = habit.logs.filter(l => l.date !== today);
        if (alreadyLogged.completed && (alreadyLogged.value === undefined || alreadyLogged.value >= 5)) xpGained -= 50;
      }
      
      newLogs = [...habit.logs.filter(l => l.date !== today), { date: today, completed: isMetricallyComplete, value }];
      if (isMetricallyComplete) xpGained += 50;

      return { ...habit, logs: newLogs, streak: calculateStreak(newLogs) };
    }));

    setUser(prev => {
      const newXp = Math.max(0, prev.xp + xpGained);
      const newLevel = Math.floor(newXp / 500) + 1;
      return { ...prev, xp: newXp, level: newLevel };
    });
    setSelectionModal(null);
  };

  const fetchInsightsAndPredictions = useCallback(async () => {
    if (habits.length === 0) return;
    setIsAiLoading(true);
    setIsPredicting(true);
    setApiStatus('loading');
    try {
      const [insight, forecast] = await Promise.all([
        getAIHabitInsights(habits),
        predictFutureResults(user, habits)
      ]);
      setAiInsight(insight);
      setPrediction(forecast);
      setApiStatus('idle');
    } catch (err: any) { 
      setApiStatus('error');
    } 
    finally { setIsAiLoading(false); setIsPredicting(false); }
  }, [habits, user]);

  const handleConsultMentor = async () => {
    setIsMentorLoading(true);
    try {
      const msg = await getMentorMotivation(user, habits, prediction || undefined);
      setMentorMessage(msg);
    } catch (err) { console.error(err); }
    finally { setIsMentorLoading(false); }
  };

  useEffect(() => {
    fetchInsightsAndPredictions();
    if (!mentorMessage) handleConsultMentor();
  }, [fetchInsightsAndPredictions]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-1 ring-white/10">
            {user.level}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-[0.2em]">Live Session (IST)</span>
              {apiStatus === 'error' && <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-[0.2em]">Quota Limit</span>}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              Phase {user.level} <span className="text-indigo-400 font-medium text-xl ml-2">{user.name}</span>
            </h1>
            <div className="flex items-center space-x-3 mt-2 w-56 md:w-72">
              <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(user.xp % 500) / 5}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all ring-1 ring-white/10">
          Inject Protocol
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {habits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onToggle={(id) => setSelectionModal({show: true, habitId: id, name: habit.name})} 
                onDelete={(id) => setHabits(prev => prev.filter(h => h.id !== id))}
                onRename={() => {}}
              />
            ))}
          </div>
          <IntensityCalendar habits={habits} />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <AIMentor user={user} habits={habits} loading={isMentorLoading} message={mentorMessage} onConsult={handleConsultMentor} />
          <PredictiveCard prediction={prediction} loading={isPredicting} />
          <AIPanel insight={aiInsight} loading={isAiLoading} onRefresh={fetchInsightsAndPredictions} />
        </div>
      </div>

      {/* Hour Selection Modal */}
      {selectionModal && selectionModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectionModal(null)}></div>
          <div className="relative bg-[#0d1117] w-full max-w-sm rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl text-center">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">{selectionModal.name}</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">Select Duration (IST Session)</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[5, 6, 8, 11].map(hr => (
                <button
                  key={hr}
                  onClick={() => handleToggleHabit(selectionModal.habitId, hr)}
                  className="bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/30 text-white py-6 rounded-2xl font-black text-xl transition-all"
                >
                  {hr}h
                </button>
              ))}
            </div>

            <button
              onClick={() => handleToggleHabit(selectionModal.habitId, 0)}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-lg shadow-red-900/20 transition-all border border-red-500/50"
            >
              0 (Protocol Failed)
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-[#0d1117] w-full max-w-lg rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">New Target</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Direct Name Only (e.g. Running)</p>
            <textarea 
              value={newHabitGoal}
              onChange={(e) => setNewHabitGoal(e.target.value)}
              placeholder="e.g. Running"
              className="w-full bg-black/40 border border-slate-800 rounded-2xl p-6 text-white mb-8 focus:ring-2 focus:ring-indigo-500 h-24 outline-none transition-all"
            />
            <button
              disabled={isSuggesting}
              onClick={async () => {
                if (!newHabitGoal.trim()) return;
                setIsSuggesting(true);
                try {
                  const sug = await suggestNewHabit(newHabitGoal);
                  const newH: Habit = {
                    ...sug as any,
                    id: 'h_' + Date.now(),
                    logs: [],
                    streak: 0,
                    isMetric: true,
                    reminders: [],
                    createdAt: new Date().toISOString()
                  };
                  setHabits(p => [newH, ...p]);
                  setShowAddModal(false);
                  setNewHabitGoal('');
                } finally { setIsSuggesting(false); }
              }}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl disabled:opacity-50"
            >
              {isSuggesting ? 'Analyzing...' : 'Finalize Protocol'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
