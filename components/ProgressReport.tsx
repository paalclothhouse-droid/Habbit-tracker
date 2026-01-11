
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Habit } from '../types';

interface ProgressReportProps {
  habits: Habit[];
}

export const ProgressReport: React.FC<ProgressReportProps> = ({ habits }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'consistency' | 'streak' | 'potential'>('overview');
  const [viewOffset, setViewOffset] = useState(0); // Days offset from today (0 = current, 30 = last month, etc.)

  // Helper to get date string for a specific date object (YYY-MM-DD for log matching)
  const getDateStr = (d: Date) => new Intl.DateTimeFormat('en-CA', { 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).format(d);

  const { data, periodLabel, startDateStr, endDateStr } = useMemo(() => {
    const result = [];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - viewOffset);
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29); // 30 day window

    // Helper to calculate streak state for a specific past date
    const getStreakForDate = (h: Habit, checkDate: Date) => {
      let s = 0;
      let d = new Date(checkDate);
      // Look back up to 60 days to find current streak at that point in time
      for(let i=0; i<60; i++) {
        const dStr = getDateStr(d);
        const log = h.logs.find(l => l.date === dStr && l.completed && (l.value === undefined || l.value >= 5));
        if (log) {
          s++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
      return s;
    };

    for (let i = 29; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      const dateStr = getDateStr(d);
      // Written date format for graph (e.g. "Oct 25")
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      let dayCompletedCount = 0;
      let dayTotalStreak = 0;

      habits.forEach(h => {
        const log = h.logs.find(l => l.date === dateStr);
        const isCompleted = log && log.completed && (log.value === undefined || log.value >= 5);
        
        if (isCompleted) {
          dayCompletedCount++;
        }
        
        // Calculate what the streak was on this specific day
        const streakOnDay = getStreakForDate(h, d);
        dayTotalStreak += streakOnDay;
      });

      const consistency = habits.length > 0 ? (dayCompletedCount / habits.length) * 100 : 0;
      const avgStreak = habits.length > 0 ? (dayTotalStreak / habits.length) : 0;
      
      // Potential: Weighted mix of consistency and streak momentum
      // Boost if consistency > 80% to simulate 'Potential'
      const momentum = avgStreak > 5 ? 10 : avgStreak * 2;
      const potential = Math.min(100, consistency + momentum + (consistency > 80 ? 10 : 0));

      result.push({
        date: displayDate,
        fullDate: dateStr,
        consistency: Math.round(consistency),
        potential: Math.round(potential),
        streak: Number(avgStreak.toFixed(1))
      });
    }
    
    return {
        data: result,
        periodLabel: `${startDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})} - ${endDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})}`,
        startDateStr: getDateStr(startDate),
        endDateStr: getDateStr(endDate)
    };
  }, [habits, viewOffset]);

  const currentConsistency = data[data.length - 1]?.consistency || 0;

  // Habit Report Data & Analysis
  const { reportData, weakestLink } = useMemo(() => {
    // Generate array of dates in the window
    const windowDates = data.map(d => d.fullDate);
    
    const calculatedHabits = habits.map(h => {
      const completions = h.logs.filter(l => windowDates.includes(l.date) && l.completed && (l.value === undefined || l.value >= 5)).length;
      const rate = (completions / 30) * 100;
      return { ...h, rate };
    });

    // Find the weakest habit (lowest rate but must have existed)
    // We assume all habits existed, or we could filter by createdAt if needed
    const sorted = [...calculatedHabits].sort((a, b) => a.rate - b.rate);
    const weak = sorted[0];

    return { reportData: calculatedHabits, weakestLink: weak };
  }, [habits, data]);

  const renderChart = () => {
    switch (activeTab) {
      case 'consistency':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} interval={4} />
              <Tooltip 
                cursor={{fill: '#1e293b', opacity: 0.4}}
                contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px'}}
                itemStyle={{color: '#818cf8', fontSize: '12px', fontWeight: 'bold'}}
              />
              <Bar dataKey="consistency" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'streak':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} interval={4} />
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px'}}
                itemStyle={{color: '#10b981', fontSize: '12px', fontWeight: 'bold'}}
              />
              <Line type="monotone" dataKey="streak" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'potential':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
               <defs>
                <linearGradient id="colorPotentialOnly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} interval={4} />
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px'}}
                itemStyle={{color: '#38bdf8', fontSize: '12px', fontWeight: 'bold'}}
              />
              <Area type="monotone" dataKey="potential" stroke="#0ea5e9" strokeWidth={3} fill="url(#colorPotentialOnly)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'overview':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPotential" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} interval={4} />
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px'}}
                itemStyle={{color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold'}}
              />
              <Area type="monotone" dataKey="potential" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorPotential)" />
              <Area type="monotone" dataKey="consistency" stroke="#6366f1" strokeWidth={3} fill="url(#colorConsistency)" />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-[#0b101a] rounded-[2rem] p-8 border border-slate-800/60 shadow-xl relative overflow-hidden mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.4em] flex items-center space-x-2">
              <i className="fa-solid fa-chart-area text-indigo-500"></i>
              <span>30-Day Performance Vector</span>
            </h3>
            {viewOffset > 0 && <span className="bg-yellow-500/20 text-yellow-500 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Historical Data</span>}
          </div>
          <div className="flex items-center space-x-4">
             <button 
               onClick={() => setViewOffset(prev => prev + 30)}
               className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-white flex items-center justify-center transition-all"
             >
               <i className="fa-solid fa-chevron-left text-xs"></i>
             </button>
             <div className="text-center">
                <h2 className="text-2xl font-black text-white leading-none">
                  <span className="text-indigo-400">{Math.round(currentConsistency)}%</span> Efficiency
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{periodLabel}</p>
             </div>
             <button 
               onClick={() => setViewOffset(prev => Math.max(0, prev - 30))}
               disabled={viewOffset === 0}
               className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:border-slate-800"
             >
               <i className="fa-solid fa-chevron-right text-xs"></i>
             </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {(['overview', 'consistency', 'streak', 'potential'] as const).map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                 activeTab === tab 
                   ? 'bg-indigo-600 text-white shadow-lg' 
                   : 'text-slate-500 hover:text-slate-300'
               }`}
             >
               {tab}
             </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] w-full mb-8">
        {renderChart()}
      </div>

      {/* Optimization Target (Weakest Link) */}
      {weakestLink && weakestLink.rate < 80 && (
         <div className="mb-8 bg-red-950/20 border border-red-900/30 rounded-xl p-5 relative overflow-hidden flex items-start space-x-4">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <i className="fa-solid fa-triangle-exclamation text-6xl text-red-500"></i>
            </div>
            <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center shrink-0 border border-red-500/20 text-red-400">
               <i className="fa-solid fa-crosshairs text-lg animate-pulse"></i>
            </div>
            <div>
               <h4 className="text-red-400 font-black text-xs uppercase tracking-[0.2em] mb-1">Priority Optimization Target</h4>
               <p className="text-slate-300 text-xs font-bold mb-2">
                 Weak Link Detected: <span className="text-white">{weakestLink.name}</span> ({Math.round(weakestLink.rate)}% Consistency)
               </p>
               <p className="text-slate-400 text-[10px] leading-relaxed max-w-md">
                 System analysis indicates this protocol is the primary drag on your potential vector. 
                 <span className="text-indigo-400 font-bold block mt-1">
                   Directive: Reduce complexity or attach to an existing anchor habit immediately.
                 </span>
               </p>
            </div>
         </div>
      )}

      {/* Habit Report Table */}
      <div className="bg-slate-900/30 rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Habit Report</h4>
           <span className="text-[10px] font-bold text-slate-600">{periodLabel}</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {reportData.map((habit) => (
            <div key={habit.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center space-x-4">
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-lg ring-1 ring-white/10" style={{background: habit.color}}>
                    {habit.name.charAt(0)}
                 </div>
                 <div>
                    <p className="text-xs font-bold text-white">{habit.name}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">{habit.category}</p>
                 </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Consistency</p>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${habit.rate > 80 ? 'bg-emerald-500' : habit.rate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{width: `${habit.rate}%`}}
                    ></div>
                  </div>
                </div>
                
                <div className="text-right min-w-[60px]">
                   <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Success</p>
                   <div className="flex items-center justify-end space-x-1.5">
                     <span className={`text-sm font-black ${habit.rate >= 80 ? 'text-emerald-400' : habit.rate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                       {Math.round(habit.rate)}%
                     </span>
                   </div>
                </div>
              </div>
            </div>
          ))}
          {reportData.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-500 text-xs">
              No habit data available for report generation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
