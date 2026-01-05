// App.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, Calendar, CheckCircle2, Flame, Plus, Trash2, 
  BarChart3, LayoutDashboard, Cloud, RefreshCw, Target, 
  Trophy, Zap, Sparkles, Heart, Moon, Sun, Download, Upload,
  ChevronDown, ChevronUp, TrendingUp, Award, Clock,
  Star, Rocket, Gem, Crown, Target as TargetIcon, Sparkle
} from 'lucide-react';


const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [year, setYear] = useState(new Date().getFullYear());
  const [weekStartsOn, setWeekStartsOn] = useState('Monday');
  const [habits, setHabits] = useState([
    { id: 1, name: 'Wake up at 4am', emoji: '⏰', target: 28, color: 'from-purple-500 to-indigo-600', streak: 7 },
    { id: 2, name: 'Meditation (30m)', emoji: '🧘', target: 25, color: 'from-violet-500 to-purple-600', streak: 5 },
    { id: 3, name: 'Running 3km (7am)', emoji: '🏃', target: 20, color: 'from-blue-500 to-indigo-600', streak: 12 },
    { id: 4, name: 'Workout', emoji: '💪', target: 22, color: 'from-purple-500 to-pink-600', streak: 8 },
    { id: 5, name: 'Read Paper', emoji: '📰', target: 25, color: 'from-indigo-500 to-blue-600', streak: 14 },
    { id: 6, name: 'Learn Java (New)', emoji: '☕', target: 22, color: 'from-purple-600 to-violet-600', streak: 3 },
    { id: 7, name: 'Revise Java', emoji: '📖', target: 22, color: 'from-violet-500 to-purple-500', streak: 9 },
    { id: 8, name: 'Instagram Limit (1.5h)', emoji: '📱', target: 30, color: 'from-purple-700 to-indigo-700', streak: 21 },
    { id: 9, name: 'Work on App', emoji: '💻', target: 20, color: 'from-indigo-500 to-blue-500', streak: 6 },
    { id: 10, name: 'Talk with Family', emoji: '🏠', target: 30, color: 'from-purple-600 to-violet-600', streak: 30 },
    { id: 11, name: 'Sleep at 10pm', emoji: '🌙', target: 28, color: 'from-indigo-600 to-purple-700', streak: 4 },
  ]);
  const [emojiLevels, setEmojiLevels] = useState([
    { threshold: 0, emoji: '🌱', color: 'from-gray-400 to-gray-300' },
    { threshold: 25, emoji: '🌿', color: 'from-purple-400 to-indigo-400' },
    { threshold: 50, emoji: '🌳', color: 'from-indigo-400 to-purple-500' },
    { threshold: 75, emoji: '🌟', color: 'from-violet-400 to-purple-400' },
    { threshold: 90, emoji: '🏆', color: 'from-purple-500 to-indigo-500' },
    { threshold: 100, emoji: '👑', color: 'from-purple-600 to-violet-600' },
  ]);
  const [completions, setCompletions] = useState({});
  const [newHabit, setNewHabit] = useState({ name: '', emoji: '✨', target: 20 });
  const [showHiddenRows, setShowHiddenRows] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [quote, setQuote] = useState('');
  const [syncStatus, setSyncStatus] = useState('saved');

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();

  // Initialize
  useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    
    setQuote("Royal discipline leads to majestic results! 👑");
    
    // Load saved data
    const savedHabits = localStorage.getItem('habitTracker_habits');
    const savedCompletions = localStorage.getItem('habitTracker_completions');
    const savedEmojiLevels = localStorage.getItem('habitTracker_emojiLevels');
    
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
    if (savedEmojiLevels) setEmojiLevels(JSON.parse(savedEmojiLevels));
  }, []);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Save data to localStorage
  const saveData = (dataType, data) => {
    localStorage.setItem(`habitTracker_${dataType}`, JSON.stringify(data));
    setSyncStatus('saved');
    setTimeout(() => setSyncStatus(''), 2000);
  };

  // Toggle completion
  const toggleCompletion = (habitId, day, month) => {
    const key = `${habitId}-${year}-${month}-${day}`;
    const newCompletions = { ...completions, [key]: !completions[key] };
    setCompletions(newCompletions);
    saveData('completions', newCompletions);
  };

  // Get habit stats
  const getHabitStats = (habitId, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let total = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${habitId}-${year}-${month}-${day}`;
      if (completions[key]) {
        total++;
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        if (tempStreak > currentStreak && day <= currentDay) currentStreak = tempStreak;
        tempStreak = 0;
      }
    }
    
    if (tempStreak > 0 && month === currentMonth) currentStreak = tempStreak;
    
    const habit = habits.find(h => h.id === habitId);
    const progress = habit ? Math.min((total / habit.target) * 100, 100) : 0;
    
    return { total, currentStreak, longestStreak, progress };
  };

  // Get progress emoji
  const getProgressEmoji = (progress) => {
    const sortedLevels = [...emojiLevels].sort((a, b) => b.threshold - a.threshold);
    for (const level of sortedLevels) {
      if (progress >= level.threshold) return level.emoji;
    }
    return emojiLevels[0].emoji;
  };

  // Add habit
  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    
    const newHabitObj = {
      id: Date.now(),
      name: newHabit.name.trim(),
      emoji: newHabit.emoji || '✨',
      target: newHabit.target || 20,
      color: getRandomGradient(),
      streak: 0
    };
    
    const newHabits = [...habits, newHabitObj];
    setHabits(newHabits);
    setNewHabit({ name: '', emoji: '✨', target: 20 });
    saveData('habits', newHabits);
  };

  // Delete habit
  const deleteHabit = (id) => {
    const newHabits = habits.filter(habit => habit.id !== id);
    setHabits(newHabits);
    saveData('habits', newHabits);
  };

  // Update habit
  const updateHabit = (id, field, value) => {
    const newHabits = habits.map(habit => 
      habit.id === id ? { ...habit, [field]: field === 'target' ? parseInt(value) || 0 : value } : habit
    );
    setHabits(newHabits);
    saveData('habits', newHabits);
  };

  // Get random gradient
  const getRandomGradient = () => {
    const gradients = [
      'from-purple-500 to-indigo-600',
      'from-violet-500 to-purple-600',
      'from-indigo-500 to-blue-600',
      'from-purple-600 to-violet-600',
      'from-indigo-400 to-purple-500',
      'from-purple-400 to-indigo-500',
      'from-violet-400 to-purple-400',
      'from-purple-700 to-indigo-700',
      'from-indigo-600 to-purple-700',
      'from-purple-500 to-indigo-500'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Get total completed today
  const getTotalCompletedToday = () => {
    let completed = 0;
    habits.forEach(habit => {
      const key = `${habit.id}-${year}-${currentMonth}-${currentDay}`;
      if (completions[key]) completed++;
    });
    return completed;
  };

  // Export data
  const exportData = () => {
    const data = {
      habits,
      emojiLevels,
      completions,
      year,
      weekStartsOn,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `routine-tracker-${year}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import data
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.habits) {
          setHabits(data.habits);
          saveData('habits', data.habits);
        }
        if (data.emojiLevels) {
          setEmojiLevels(data.emojiLevels);
          saveData('emojiLevels', data.emojiLevels);
        }
        if (data.completions) {
          setCompletions(data.completions);
          saveData('completions', data.completions);
        }
        if (data.year) setYear(data.year);
        if (data.weekStartsOn) setWeekStartsOn(data.weekStartsOn);
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week
  const getDayOfWeek = (day, month, year) => {
    return new Date(year, month, day).getDay();
  };

  // Get overall progress
  const getOverallProgress = () => {
    if (habits.length === 0) return 0;
    const totalProgress = habits.reduce((sum, habit) => {
      const stats = getHabitStats(habit.id, currentMonth);
      return sum + stats.progress;
    }, 0);
    return Math.round(totalProgress / habits.length);
  };

  // Get best streak
  const getBestStreak = () => {
    let best = 0;
    habits.forEach(habit => {
      const stats = getHabitStats(habit.id, currentMonth);
      if (stats.longestStreak > best) best = stats.longestStreak;
    });
    return best;
  };

  // Get current streak
  const getCurrentStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      
      let hasCompletion = false;
      habits.forEach(habit => {
        const key = `${habit.id}-${year}-${month}-${day}`;
        if (completions[key]) hasCompletion = true;
      });
      
      if (hasCompletion) streak++;
      else if (i === 0) continue;
      else break;
    }
    
    return streak;
  };

  // Get completion percentage for today
  const getTodayPercentage = () => {
    if (habits.length === 0) return 0;
    return Math.round((getTotalCompletedToday() / habits.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 text-gray-900 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(147, 51, 234, 0.1);
        }
        .gradient-text {
          background: linear-gradient(135deg, #9333EA, #7C3AED, #4F46E5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pulse-ring {
          animation: pulse-ring 2s infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
        .bounce-in {
          animation: bounce-in 0.5s;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <header className="glass-card rounded-3xl p-4 md:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1 w-full lg:w-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-md opacity-60"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-2xl">
                    <Crown className="text-white" size={24} />
                  </div>
                </div>
                <h1 className="text-2xl md:text-4xl font-black gradient-text">Royal Habit Tracker</h1>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2">
                <p className="text-gray-800 font-medium">{currentDate}</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    syncStatus === 'saving' ? 'bg-yellow-400 animate-pulse ring-2 ring-yellow-200' :
                    syncStatus === 'saved' ? 'bg-green-400 ring-2 ring-green-200' : 'bg-purple-400 ring-2 ring-purple-200'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-600">
                    {syncStatus === 'saving' ? 'Saving...' : 
                     syncStatus === 'saved' ? 'All changes saved' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="flex bg-purple-100 rounded-2xl p-1 shadow-inner w-full sm:w-auto overflow-x-auto">
                {['dashboard', 'tracker', 'setup'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 sm:flex-none px-4 md:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tab === 'dashboard' && <LayoutDashboard size={16} />}
                      {tab === 'tracker' && <Calendar size={16} />}
                      {tab === 'setup' && <Settings size={16} />}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-end items-center sm:items-end">
                <div className="flex items-center justify-end gap-2">
                  <Clock className="text-purple-500" size={18} />
                  <div className="text-xl font-bold text-gray-900">{currentTime}</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 flex-1 bg-purple-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
                      style={{ width: `${getTodayPercentage()}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {getTotalCompletedToday()}/{habits.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-purple-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg">
                    <Sparkle className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{quote}</h2>
                </div>
                <p className="text-gray-700 font-medium mt-2">
                  Royal discipline creates extraordinary habits
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full md:w-auto appearance-none px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y} className="bg-white text-gray-800">{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" size={20} />
                </div>
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={weekStartsOn}
                    onChange={(e) => setWeekStartsOn(e.target.value)}
                    className="w-full md:w-auto appearance-none px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <option value="Monday" className="bg-white text-gray-800">Week starts Monday</option>
                    <option value="Sunday" className="bg-white text-gray-800">Week starts Sunday</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" size={20} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card rounded-3xl p-6 border-l-4 border-l-purple-400">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur-lg opacity-50 pulse-ring"></div>
                    <div className="relative p-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                      <Target className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600">Overall Progress</div>
                    <div className="text-3xl font-black text-gray-900">{getOverallProgress()}%</div>
                  </div>
                </div>
                <div className="h-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
                    style={{ width: `${getOverallProgress()}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="glass-card rounded-3xl p-6 border-l-4 border-l-violet-400">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full blur-lg opacity-50"></div>
                    <div className="relative p-3 bg-gradient-to-r from-violet-400 to-purple-400 rounded-xl">
                      <Flame className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600">Current Streak</div>
                    <div className="text-3xl font-black text-gray-900 flex items-center gap-3">
                      {getCurrentStreak()}
                      {getCurrentStreak() > 0 && <Flame size={24} className="text-violet-400" fill="currentColor" />}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {getCurrentStreak() > 0 ? '🔥 Keep the royal flame burning!' : 'Start your royal streak today!'}
                </div>
              </div>
              
              <div className="glass-card rounded-3xl p-6 border-l-4 border-l-indigo-400">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full blur-lg opacity-50"></div>
                    <div className="relative p-3 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-xl">
                      <Trophy className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600">Best Streak</div>
                    <div className="text-3xl font-black text-gray-900">{getBestStreak()}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {getBestStreak() > 0 ? '👑 Your royal record!' : 'Set your first royal record!'}
                </div>
              </div>
              
              <div className="glass-card rounded-3xl p-6 border-l-4 border-l-fuchsia-400">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-full blur-lg opacity-50"></div>
                    <div className="relative p-3 bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-xl">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600">Today's Progress</div>
                    <div className="text-3xl font-black text-gray-900">{getTodayPercentage()}%</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {getTotalCompletedToday()} of {habits.length} habits completed
                </div>
              </div>
            </div>

            {/* Performance Graph */}
            <div className="glass-card rounded-3xl p-4 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Royal Performance Overview</h2>
                    <p className="text-gray-700 font-medium">
                      {new Date(year, currentMonth).toLocaleString('default', { month: 'long' })} Progress
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="text-yellow-400 fill-current" size={20} />
                  <span className="font-bold text-gray-700">Royal Habits: {habits.length}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {habits.map(habit => {
                  const stats = getHabitStats(habit.id, currentMonth);
                  const progress = Math.min(stats.progress, 100);
                  const emoji = getProgressEmoji(progress);
                  
                  return (
                    <div key={habit.id} className="space-y-3 bounce-in">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="text-3xl">{habit.emoji}</span>
                            <div>
                              <div className="font-bold text-gray-900">{habit.name}</div>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="font-medium text-gray-600">
                                  Target: {habit.target}/month
                                </span>
                                {stats.currentStreak > 0 && (
                                  <span className="flex items-center gap-1 font-medium text-violet-600">
                                    <Flame size={14} /> {stats.currentStreak}d streak
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <div className="text-right">
                            <div className="text-2xl font-black text-gray-900">{Math.round(progress)}%</div>
                            <div className="text-sm font-medium text-gray-600">
                              {stats.total}/{habit.target} days
                            </div>
                          </div>
                          <span className="text-4xl">{emoji}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="h-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${habit.color}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm font-medium">
                          <span className="text-gray-600">0%</span>
                          <span className="text-gray-600">100%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-3xl p-4 md:p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Royal Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur-lg opacity-50 group-hover:blur-xl transition-all"></div>
                      <div className="relative p-4 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                        <Download className="text-white" size={28} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg mb-1">Export Royal Data</div>
                      <div className="text-gray-600">
                        Download all your progress as JSON
                      </div>
                    </div>
                    <button
                      onClick={exportData}
                      className="px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold rounded-xl hover:shadow-lg transition-shadow"
                    >
                      Export
                    </button>
                  </div>
                </div>
                
                <div className="group p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-xl blur-lg opacity-50 group-hover:blur-xl transition-all"></div>
                      <div className="relative p-4 bg-gradient-to-r from-violet-400 to-purple-400 rounded-xl">
                        <Upload className="text-white" size={28} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg mb-1">Import Royal Data</div>
                      <div className="text-gray-700">
                        Restore from backup file
                      </div>
                    </div>
                    <label className="px-6 py-3 bg-gradient-to-r from-violet-400 to-purple-400 text-white font-bold rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
                      Import
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tracker Tab */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="p-4 md:p-8 bg-gradient-to-r from-purple-600 to-indigo-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Calendar className="text-white" size={28} />
                    <h2 className="text-2xl font-black text-white">
                      {new Date(year, currentMonth).toLocaleString('default', { month: 'long' })} {year} - Royal Habit Tracker
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <TargetIcon className="text-white" size={18} />
                    <span className="text-white font-bold">
                      Click on days to mark royal habits
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-100">
                      <th className="text-left p-3 md:p-6 font-black text-gray-700 sticky left-0 bg-gradient-to-r from-white to-purple-50 z-10 min-w-[200px]">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="p-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg">
                            <Calendar className="text-white" size={20} />
                          </div>
                          <span className="text-lg">Royal Habits</span>
                        </div>
                      </th>
                      {Array.from({ length: getDaysInMonth(currentMonth, year) }, (_, i) => i + 1).map(day => {
                        const isToday = day === currentDay && year === currentYear && currentMonth === today.getMonth();
                        const dayOfWeek = getDayOfWeek(day, currentMonth, year);
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        
                        return (
                          <th
                            key={day}
                            className={`text-center p-3 font-bold ${
                              isToday 
                                ? 'bg-gradient-to-r from-purple-400 to-indigo-400 text-white' 
                                : isWeekend
                                ? 'text-purple-400'
                                : 'text-gray-700'
                            }`}
                          >
                            <div className="text-lg">{day}</div>
                            <div className="text-xs font-medium">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}
                            </div>
                          </th>
                        );
                      })}
                      <th className="text-center p-3 md:p-6 font-black text-gray-700 bg-gradient-to-r from-white to-purple-50 min-w-[150px]">
                        Royal Stats
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {habits.slice(0, showHiddenRows ? habits.length : 7).map((habit) => {
                      const stats = getHabitStats(habit.id, currentMonth);
                      const emoji = getProgressEmoji(stats.progress);
                      
                      return (
                        <tr key={habit.id} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                          <td className="p-3 md:p-6 sticky left-0 bg-gradient-to-r from-white to-purple-50 z-10">
                            <div className="flex items-center gap-2 md:gap-4">
                              <div className="relative hidden sm:block">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur-md opacity-50"></div>
                                <span className="relative text-3xl">{habit.emoji}</span>
                              </div>
                              <div className="relative sm:hidden text-2xl">
                                {habit.emoji}
                              </div>
                              <div>
                                <div className="font-bold text-gray-800 text-sm md:text-base">{habit.name}</div>
                                <div className="text-xs md:text-sm font-medium text-gray-600">
                                  Target: {habit.target}/month
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {Array.from({ length: getDaysInMonth(currentMonth, year) }, (_, i) => i + 1).map(day => {
                            const key = `${habit.id}-${year}-${currentMonth}-${day}`;
                            const isCompleted = completions[key];
                            const isToday = day === currentDay && year === currentYear && currentMonth === today.getMonth();
                            const isFuture = new Date(year, currentMonth, day) > today;
                            
                            return (
                              <td key={day} className="p-2">
                                <button
                                  onClick={() => !isFuture && toggleCompletion(habit.id, day, currentMonth)}
                                  disabled={isFuture}
                                  className={`
                                    w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-all duration-200
                                    ${isCompleted
                                      ? 'bg-gradient-to-br from-purple-400 to-indigo-400 text-white shadow-lg hover:shadow-xl'
                                      : isToday
                                      ? 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 shadow'
                                      : 'bg-gradient-to-br from-purple-50 to-indigo-50 text-gray-500 hover:shadow-lg'
                                    }
                                    ${isFuture ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
                                  `}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 size={22} strokeWidth={2.5} />
                                  ) : isFuture ? (
                                    <span className="text-sm font-bold">-</span>
                                  ) : (
                                    <span className="text-xl font-bold">+</span>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                          
                          <td className="p-3 md:p-6 bg-gradient-to-r from-white to-purple-50">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-600">Total:</span>
                                <span className="font-black text-2xl text-gray-800">{stats.total}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-600">Streak:</span>
                                <div className="flex items-center gap-2">
                                  <Flame size={18} className={stats.currentStreak > 0 ? 'text-violet-400' : 'text-purple-400'} />
                                  <span className="font-bold text-lg text-gray-800">{stats.currentStreak}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-600">Progress:</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl">{emoji}</span>
                                  <span className="font-black text-2xl text-gray-800">{Math.round(stats.progress)}%</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {habits.length > 7 && !showHiddenRows && (
                  <div className="p-6 text-center bg-gradient-to-r from-purple-50 to-indigo-50">
                    <button
                      onClick={() => setShowHiddenRows(true)}
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      <ChevronDown size={20} />
                      Show {habits.length - 7} more royal habits
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="glass-card rounded-3xl p-4 md:p-8">
              <h2 className="text-2xl font-black text-gray-800 mb-6">Royal Monthly Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="text-yellow-400" size={24} />
                    <h3 className="font-bold text-gray-700">Royal Top Performers</h3>
                  </div>
                  {habits
                    .map(habit => ({ ...habit, stats: getHabitStats(habit.id, currentMonth) }))
                    .sort((a, b) => b.stats.progress - a.stats.progress)
                    .slice(0, 3)
                    .map((habit, index) => (
                      <div key={habit.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg font-bold text-white">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{habit.emoji}</span>
                            <span className="font-medium">{habit.name}</span>
                          </div>
                        </div>
                        <span className="font-black text-2xl text-purple-600">
                          {Math.round(habit.stats.progress)}%
                        </span>
                      </div>
                    ))}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <TargetIcon className="text-violet-400" size={24} />
                    <h3 className="font-bold text-gray-700">Need Royal Attention</h3>
                  </div>
                  {habits
                    .map(habit => ({ ...habit, stats: getHabitStats(habit.id, currentMonth) }))
                    .sort((a, b) => a.stats.progress - b.stats.progress)
                    .slice(0, 3)
                    .map((habit, index) => (
                      <div key={habit.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-violet-400 to-purple-400 rounded-lg font-bold text-white">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{habit.emoji}</span>
                            <span className="font-medium">{habit.name}</span>
                          </div>
                        </div>
                        <span className="font-black text-2xl text-violet-600">
                          {Math.round(habit.stats.progress)}%
                        </span>
                      </div>
                    ))}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Flame className="text-fuchsia-400" size={24} />
                    <h3 className="font-bold text-gray-700">Royal Streaks</h3>
                  </div>
                  {habits
                    .map(habit => ({ ...habit, stats: getHabitStats(habit.id, currentMonth) }))
                    .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak)
                    .slice(0, 3)
                    .map((habit, index) => (
                      <div key={habit.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-fuchsia-50 to-purple-50 rounded-xl border border-fuchsia-200">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-lg font-bold text-white">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            <Flame size={20} className={habit.stats.currentStreak > 0 ? 'text-fuchsia-400' : 'text-purple-400'} />
                            <span className="font-medium">{habit.name}</span>
                          </div>
                        </div>
                        <span className="font-black text-2xl text-fuchsia-600">
                          {habit.stats.currentStreak} days
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-4 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur-lg opacity-50"></div>
                    <div className="relative p-4 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                      <Settings className="text-white" size={28} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">Royal Habit Configuration</h2>
                    <p className="text-violet-600 font-medium mt-2">
                      Customize your royal habits, targets, and progress emojis
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black gradient-text">{habits.length}</div>
                  <div className="text-sm font-bold text-gray-600">Royal Habits</div>
                </div>
              </div>
              
              {/* Add New Habit */}
              <div className="mb-8 p-4 md:p-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-dashed border-purple-300">
                <h3 className="font-black text-gray-800 text-xl mb-6 flex items-center gap-3">
                  <Plus className="text-purple-500" size={24} />
                  Add New Royal Habit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Royal Habit Name
                    </label>
                    <input
                      type="text"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                      placeholder="e.g., Drink 2L water daily"
                      className="w-full px-5 py-4 border-2 border-purple-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Royal Emoji
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newHabit.emoji}
                        onChange={(e) => setNewHabit({...newHabit, emoji: e.target.value})}
                        placeholder="✨"
                        maxLength="2"
                        className="w-full px-5 py-4 border-2 border-purple-300 rounded-xl bg-white text-center text-3xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Monthly Target
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={newHabit.target}
                        onChange={(e) => setNewHabit({...newHabit, target: parseInt(e.target.value) || 20})}
                        className="w-full px-5 py-4 border-2 border-purple-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={addHabit}
                      className="px-6 py-4 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Habit List */}
              <div className="space-y-4">
                {habits.map((habit) => {
                  const stats = getHabitStats(habit.id, currentMonth);
                  
                  return (
                    <div key={habit.id} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-4 md:p-6 border-2 border-purple-100 rounded-2xl hover:shadow-lg transition-all relative">
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="absolute top-4 right-4 md:static p-2 md:p-3 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-500 hover:text-purple-600 rounded-xl transition-colors z-10"
                      >
                        <Trash2 size={20} />
                      </button>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-8 md:pt-0">
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            value={habit.emoji}
                            onChange={(e) => updateHabit(habit.id, 'emoji', e.target.value)}
                            maxLength="2"
                            className="w-16 h-16 text-4xl text-center border-2 border-purple-300 rounded-xl bg-white"
                          />
                          <input
                            type="text"
                            value={habit.name}
                            onChange={(e) => updateHabit(habit.id, 'name', e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-xl bg-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">
                            Monthly Target
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={habit.target}
                            onChange={(e) => updateHabit(habit.id, 'target', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl bg-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">
                            Current Progress
                          </label>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="h-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full bg-gradient-to-r ${habit.color}`}
                                  style={{ width: `${Math.min(stats.progress, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="font-black text-2xl text-gray-800">{Math.round(stats.progress)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emoji Levels Configuration */}
            <div className="glass-card rounded-3xl p-4 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                  <Gem className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Royal Progress Emoji Levels</h2>
                  <p className="text-violet-600 font-medium mt-1">
                    Set different royal emojis that appear as you reach certain completion percentages
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {emojiLevels.map((level, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 border-2 border-purple-100 rounded-2xl">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Completion Threshold (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={level.threshold}
                          onChange={(e) => {
                            const newLevels = [...emojiLevels];
                            newLevels[index].threshold = parseInt(e.target.value) || 0;
                            setEmojiLevels(newLevels.sort((a, b) => a.threshold - b.threshold));
                          }}
                          className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Royal Emoji
                        </label>
                        <input
                          type="text"
                          value={level.emoji}
                          onChange={(e) => {
                            const newLevels = [...emojiLevels];
                            newLevels[index].emoji = e.target.value;
                            setEmojiLevels([...newLevels]);
                          }}
                          maxLength="2"
                          className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl bg-white text-3xl text-center"
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl mb-2">{level.emoji}</div>
                      <div className="text-sm font-bold text-gray-600">
                        ≥{level.threshold}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setEmojiLevels([...emojiLevels, { threshold: 0, emoji: '✨', color: 'from-gray-400 to-gray-300' }])}
                className="mt-6 px-6 py-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-bold hover:border-purple-400 transition-colors w-full"
              >
                + Add Royal Emoji Level
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="glass-card rounded-3xl p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur-lg opacity-50"></div>
                <div className="relative p-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                  <Crown className="text-white" size={24} />
                </div>
              </div>
              <div>
                <div className="font-black text-gray-800">Built for Royal Discipline & Growth</div>
                <div className="text-violet-600 font-medium">
                  Track your royal journey to better habits
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="flex items-center gap-2 text-violet-500 font-black text-lg">
                  <Flame size={18} fill="currentColor" />
                  {getCurrentStreak()} DAY STREAK
                </div>
                <div className="text-gray-600 font-bold">
                  {getTotalCompletedToday()}/{habits.length} DONE TODAY
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="text-purple-500" size={20} />
                <div className="font-mono font-black text-gray-800 text-xl">
                  {currentTime}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;