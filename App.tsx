
import React, { useState, useEffect, useCallback } from 'react';
import { Habit, AIInsight, Frequency, UserProfile, AIPrediction } from './types';
import { HabitCard } from './components/HabitCard';
import { AIPanel } from './components/AIPanel';
import { AIMentor } from './components/AIMentor';
import { PredictiveCard } from './components/PredictiveCard';
import { IntensityCalendar } from './components/IntensityCalendar';
import { AuthScreen } from './components/AuthScreen';
import { ProgressReport } from './components/ProgressReport';
import { getAIHabitInsights, suggestNewHabit, getMentorMotivation, predictFutureResults, askOracle } from './services/geminiService';

const STORAGE_KEYS = {
  HABITS: 'hq_habits_v9',
  USER: 'hq_user_v9',
};

// Helper to get current date in Local Timezone
const getCurrentDate = () => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
};

const INITIAL_HABITS: Habit[] = [
  {
    id: 'sleep-1',
    name: 'Sleep Protocol',
    description: 'Maintain biological runtime efficiency. < 5h = FAILURE.',
    category: 'Health',
    frequency: Frequency.DAILY,
    streak: 0,
    logs: [],
    reminders: [],
    createdAt: new Date().toISOString(),
    color: '#6366f1',
    isMetric: true
  },
  {
    id: 'study-1',
    name: 'Neural Upload',
    description: 'Expand cognitive database. < 5h = STAGNATION.',
    category: 'Study',
    frequency: Frequency.DAILY,
    streak: 0,
    logs: [],
    reminders: [],
    createdAt: new Date().toISOString(),
    color: '#8b5cf6',
    isMetric: true
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
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

  // Oracle Chat State (Keep state but hide UI in this version)
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleResponse, setOracleResponse] = useState('');
  const [isOracleThinking, setIsOracleThinking] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }, [habits, user]);

  const calculateStreak = (logs: {date: string, completed: boolean, value?: number}[]) => {
    if (!logs || logs.length === 0) return 0;
    const completedDates = new Set(
      logs.filter(l => l.completed && (l.value === undefined || l.value >= 5)).map(l => l.date)
    );
    let streak = 0;
    let checkDate = new Date();
    let checkDateStr = getCurrentDate();
    
    if (!completedDates.has(checkDateStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(checkDate);
    }
    while (completedDates.has(checkDateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(checkDate);
    }
    return streak;
  };

  const handleToggleHabit = (id: string, value: number) => {
    const today = getCurrentDate();
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
      if (!prev) return null;
      const newXp = Math.max(0, prev.xp + xpGained);
      const newLevel = Math.floor(newXp / 500) + 1;
      return { ...prev, xp: newXp, level: newLevel };
    });
    setSelectionModal(null);
  };

  const fetchInsightsAndPredictions = useCallback(async () => {
    if (habits.length === 0 || !user) return;
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
    if (!user) return;
    setIsMentorLoading(true);
    try {
      const msg = await getMentorMotivation(user, habits, prediction || undefined);
      setMentorMessage(msg);
    } catch (err) { console.error(err); }
    finally { setIsMentorLoading(false); }
  };

  const handleAskOracle = async () => {
    if (!oracleQuery.trim()) return;
    setIsOracleThinking(true);
    setOracleResponse('');
    try {
      const resp = await askOracle(oracleQuery, { user, habits });
      setOracleResponse(resp);
    } catch (err) {
      setOracleResponse("UPLINK FAILED.");
    } finally {
      setIsOracleThinking(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInsightsAndPredictions();
      if (!mentorMessage) handleConsultMentor();
    }
  }, [fetchInsightsAndPredictions, user]); 

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  if (!user) {
    return <AuthScreen onAuthenticated={(u) => setUser(u)} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-1 ring-white/10 overflow-hidden relative">
             <i className="fa-solid fa-user-astronaut"></i>
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              {apiStatus === 'error' && <span className="text-[9px] font-black text-red-500 bg-red-950/30 px-2 py-0.5 rounded uppercase tracking-[0.2em]">Connection Lost</span>}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase mt-1">
              Ghost <span className="text-indigo-500">Hardened</span>
            </h1>
            <div className="flex items-center space-x-3 mt-3 w-56 md:w-72">
              <span className="text-[10px] font-bold text-slate-500 w-8">LVL {user.level}</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${(user.xp % 500) / 5}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
            title="Disconnect"
          >
            <i className="fa-solid fa-power-off"></i>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Initialize
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* New Progress Report Component */}
          <ProgressReport habits={habits} />

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
          
          <div className="bg-[#0b101a] border border-slate-800/60 p-6 rounded-[2rem]">
             <div className="flex items-center space-x-3 mb-4">
                <i className="fa-solid fa-terminal text-indigo-500"></i>
                <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs">Command Line</h3>
             </div>
             <div className="flex gap-2">
               <input 
                 value={oracleQuery} 
                 onChange={(e) => setOracleQuery(e.target.value)} 
                 onKeyDown={(e) => e.key === 'Enter' && handleAskOracle()}
                 className="flex-1 bg-black border border-slate-800 text-slate-300 text-xs p-3 rounded-lg focus:outline-none focus:border-indigo-500 font-mono" 
                 placeholder="Query Aura..." 
               />
               <button 
                 onClick={handleAskOracle} 
                 disabled={isOracleThinking}
                 className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-lg font-bold uppercase text-xs transition-colors disabled:opacity-50"
               >
                 {isOracleThinking ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Run'}
               </button>
             </div>
             {oracleResponse && (
               <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-lg">
                 <p className="text-xs text-indigo-300 leading-relaxed font-mono">>> {oracleResponse}</p>
               </div>
             )}
          </div>

        </div>
      </div>

      {/* Hour Selection Modal */}
      {selectionModal && selectionModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectionModal(null)}></div>
          <div className="relative bg-[#05070a] w-full max-w-sm rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl text-center">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">{selectionModal.name}</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">Select Duration</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[5, 6, 8, 11].map(hr => (
                <button
                  key={hr}
                  onClick={() => handleToggleHabit(selectionModal.habitId, hr)}
                  className="bg-slate-900 hover:bg-indigo-600 border border-slate-800 text-slate-300 hover:text-white py-6 rounded-2xl font-black text-xl transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:border-transparent"
                >
                  {hr}h
                </button>
              ))}
            </div>

            <button
              onClick={() => handleToggleHabit(selectionModal.habitId, 0)}
              className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-500 hover:text-red-400 py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all border border-red-900/30"
            >
              0 (Fail)
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-[#05070a] w-full max-w-lg rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Initialize</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Define Protocol (e.g. Meditation)</p>
            <textarea 
              value={newHabitGoal}
              onChange={(e) => setNewHabitGoal(e.target.value)}
              placeholder="e.g. Meditation"
              className="w-full bg-black border border-slate-800 rounded-2xl p-6 text-white mb-8 focus:ring-1 focus:ring-indigo-500 h-24 outline-none transition-all placeholder-slate-700"
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
              className="w-full bg-white hover:bg-slate-200 text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 transition-all"
            >
              {isSuggesting ? 'Processing...' : 'Engage'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
