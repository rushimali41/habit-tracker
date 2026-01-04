import React, { useState, useEffect } from 'react';
import { 
  Settings, Calendar, CheckCircle2, Flame, Plus, Trash2, 
  CalendarDays, Circle, BarChart3, LayoutDashboard, Cloud, 
  RefreshCw, Smartphone, Save
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * CONFIGURATION LOGIC
 * Safely handles Firebase config for Vite (VITE_), Next.js (NEXT_PUBLIC_), 
 * or local preview environments.
 */
const getFirebaseConfig = () => {
  try {
    // 1. Check for Vite Environment (Vercel React apps)
    if (import.meta.env?.VITE_FIREBASE_CONFIG) {
      return JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
    }
    // 2. Check for Next.js Environment
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_CONFIG) {
      return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    }
    // 3. Fallback for Local Environment
    if (typeof window !== 'undefined' && window.__firebase_config) {
      return JSON.parse(window.__firebase_config);
    }
  } catch (e) {
    console.error("Firebase config parsing failed:", e);
  }
  return null;
};

const firebaseConfig = getFirebaseConfig();
const appId = (typeof window !== 'undefined' && window.__app_id) ? window.__app_id : 'my-habit-tracker-v1';

let db, auth;
if (firebaseConfig && getApps().length === 0) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const INITIAL_HABITS = [
  { id: '1', name: 'Wake up at 4am', target: 28, emoji: '⏰' },
  { id: '2', name: 'Meditation (30m)', target: 25, emoji: '🧘' },
  { id: '3', name: 'Running 3km (7am)', target: 20, emoji: '🏃' },
  { id: '4', name: 'Workout', target: 22, emoji: '💪' },
  { id: '5', name: 'Read Paper', target: 25, emoji: '📰' },
  { id: '6', name: 'Learn Java (New)', target: 22, emoji: '☕' },
  { id: '7', name: 'Revise Java', target: 22, emoji: '📖' },
  { id: '8', name: 'Instagram Limit (1.5h)', target: 30, emoji: '📱' },
  { id: '9', name: 'Work on App', target: 20, emoji: '💻' },
  { id: '10', name: 'Talk with Family', target: 30, emoji: '🏠' },
  { id: '11', name: 'Sleep at 10pm', target: 28, emoji: '🌙' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [year] = useState(new Date().getFullYear());
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [completions, setCompletions] = useState({});
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('local');

  const currentMonthIndex = new Date().getMonth();

  // Initialize Auth
  useEffect(() => {
    if (!auth) return;
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Load from LocalStorage for speed
  useEffect(() => {
    const savedCompletions = localStorage.getItem(`habits_${year}`);
    if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
    const savedHabits = localStorage.getItem(`habits_list`);
    if (savedHabits) setHabits(JSON.parse(savedHabits));
  }, [year]);

  // Sync with Cloud
  useEffect(() => {
    if (!user || !db) return;
    setSyncStatus('syncing');
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'data');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.completions) setCompletions(data.completions);
        if (data.habits) setHabits(data.habits);
        setSyncStatus('synced');
      }
    }, (err) => {
      console.error("Cloud sync error:", err);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [user]);

  const saveData = async (newCompletions, newHabits) => {
    localStorage.setItem(`habits_${year}`, JSON.stringify(newCompletions));
    localStorage.setItem(`habits_list`, JSON.stringify(newHabits));

    if (user && db) {
      setSyncStatus('syncing');
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'data');
        await setDoc(docRef, { 
          completions: newCompletions, 
          habits: newHabits,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setSyncStatus('synced');
      } catch (err) {
        console.error("Cloud save error:", err);
        setSyncStatus('error');
      }
    }
  };

  const toggleCompletion = (habitId, y, m, d) => {
    const key = `${habitId}-${y}-${m}-${d}`;
    const newCompletions = { ...completions, [key]: !completions[key] };
    setCompletions(newCompletions);
    saveData(newCompletions, habits);
  };

  const getStats = (habitId, monthIndex) => {
    let total = 0;
    let currentStreak = 0;
    const daysCount = new Date(year, monthIndex + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === monthIndex;

    for (let d = 1; d <= daysCount; d++) {
      if (completions[`${habitId}-${year}-${monthIndex}-${d}`]) total++;
    }
    
    if (isCurrentMonth) {
      for (let d = today.getDate(); d >= 1; d--) {
        if (completions[`${habitId}-${year}-${monthIndex}-${d}`]) currentStreak++;
        else if (d < today.getDate()) break;
      }
    }
    return { total, currentStreak };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Mobile-Ready Header */}
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Smartphone size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">Routine</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                {syncStatus === 'synced' ? (
                  <><Cloud size={10} className="text-green-500" /> Cloud Active</>
                ) : syncStatus === 'syncing' ? (
                  <><RefreshCw size={10} className="animate-spin text-amber-500" /> Updating...</>
                ) : (
                  <><Save size={10} /> Local Mode</>
                )}
              </p>
            </div>
          </div>
          <nav className="flex bg-slate-100 p-1 rounded-xl">
            {['dashboard', 'tracker', 'setup'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter transition-all ${
                  activeTab === t ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </nav>
        </header>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-100">
                <p className="text-[10px] uppercase font-bold opacity-70 mb-1 tracking-widest">Global Streak</p>
                <h3 className="text-4xl font-black">
                  {Math.max(...habits.map(h => getStats(h.id, currentMonthIndex).currentStreak), 0)}
                </h3>
                <p className="text-[10px] mt-2 opacity-80 uppercase font-bold">Days unbroken</p>
              </div>
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Efficiency</p>
                <h3 className="text-4xl font-black text-slate-800">
                  {Math.round(habits.reduce((acc, h) => acc + (getStats(h.id, currentMonthIndex).total / h.target), 0) / habits.length * 100) || 0}%
                </h3>
                <p className="text-[10px] mt-2 text-slate-400 uppercase font-bold">Goal completion</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xs font-black uppercase text-slate-400 mb-8 flex items-center gap-2 tracking-widest">
                <BarChart3 size={16} className="text-indigo-500" /> Performance Graph
              </h2>
              <div className="space-y-6">
                {habits.map(h => {
                  const s = getStats(h.id, currentMonthIndex);
                  const rate = Math.min((s.total / h.target) * 100, 100);
                  return (
                    <div key={h.id} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <span className="flex items-center gap-3">
                          <span className="text-2xl drop-shadow-sm">{h.emoji}</span>
                          <span className="text-[11px] font-bold text-slate-700">{h.name}</span>
                        </span>
                        <span className="text-xs font-black text-indigo-600">{Math.round(rate)}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
                        <div 
                          className={`h-full transition-all duration-1000 rounded-full ${rate >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                          style={{width: `${rate}%`}} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tracker Tab */}
        {activeTab === 'tracker' && (
           <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
             <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
               <span className="text-xs font-black uppercase tracking-widest">{MONTH_NAMES[currentMonthIndex]} {year}</span>
               <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] opacity-60 font-bold uppercase">Logging Mode</span>
               </div>
             </div>
             <div className="overflow-x-auto scrollbar-hide">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 border-b text-[10px] text-slate-400 font-black">
                     <th className="p-4 sticky left-0 bg-slate-50 border-r min-w-[140px] z-20 shadow-sm">HABIT</th>
                     {Array.from({length: new Date(year, currentMonthIndex + 1, 0).getDate()}, (_, i) => i + 1).map(d => (
                       <th key={d} className={`p-2 text-center min-w-[40px] ${new Date().getDate() === d ? 'text-indigo-600 bg-indigo-50/50' : ''}`}>{d}</th>
                     ))}
                     <th className="p-4 border-l text-center">SCORE</th>
                   </tr>
                 </thead>
                 <tbody>
                   {habits.map(h => {
                      const s = getStats(h.id, currentMonthIndex);
                      return (
                        <tr key={h.id} className="border-b hover:bg-indigo-50/10 transition-colors">
                          <td className="p-4 sticky left-0 bg-white border-r text-[11px] font-bold z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{h.emoji}</span>
                              <span className="truncate max-w-[100px] text-slate-600">{h.name}</span>
                            </div>
                          </td>
                          {Array.from({length: new Date(year, currentMonthIndex + 1, 0).getDate()}, (_, i) => i + 1).map(d => {
                            const active = completions[`${h.id}-${year}-${currentMonthIndex}-${d}`];
                            const isToday = new Date().getDate() === d;
                            return (
                              <td key={d} className={`p-1 ${isToday ? 'bg-indigo-50/20' : ''}`}>
                                <button 
                                  onClick={() => toggleCompletion(h.id, year, currentMonthIndex, d)}
                                  className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-all transform active:scale-75 ${
                                    active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-transparent hover:bg-slate-200'
                                  }`}
                                >
                                  <CheckCircle2 size={16} strokeWidth={3} />
                                </button>
                              </td>
                            );
                          })}
                          <td className="p-4 border-l text-center text-xs font-black text-slate-400">
                            {s.total}<span className="opacity-40 font-normal">/{h.target}</span>
                          </td>
                        </tr>
                      );
                   })}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="bg-white p-6 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2 tracking-tight">
              <Settings size={18} className="text-slate-400" /> Routine Editor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map(h => (
                <div key={h.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-indigo-300">
                  <span className="text-2xl bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm border border-slate-100">{h.emoji}</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-tighter">Habit</p>
                    <input 
                      className="w-full bg-transparent text-sm font-black outline-none text-slate-700"
                      value={h.name}
                      onChange={(e) => {
                        const newList = habits.map(item => item.id === h.id ? {...item, name: e.target.value} : item);
                        setHabits(newList);
                        saveData(completions, newList);
                      }}
                    />
                  </div>
                  <div className="text-right border-l pl-4 border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-tighter">Target</p>
                    <input 
                      type="number"
                      className="w-10 bg-white border border-slate-200 rounded p-1.5 text-center text-xs font-black shadow-sm"
                      value={h.target}
                      onChange={(e) => {
                        const newList = habits.map(item => item.id === h.id ? {...item, target: parseInt(e.target.value) || 0} : item);
                        setHabits(newList);
                        saveData(completions, newList);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-indigo-50 rounded-xl flex items-center gap-3 text-indigo-700">
              <RefreshCw size={18} className="animate-spin-slow opacity-50" />
              <p className="text-[11px] font-bold">Autosync is active. Your routine is safe in the cloud.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}