// App.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, Calendar, CheckCircle2, Flame, Plus, Trash2, 
  BarChart3, LayoutDashboard, Cloud, RefreshCw, Target, 
  Trophy, Zap, Sparkles, Heart, Moon, Sun, Download, Upload,
  ChevronDown, ChevronUp, TrendingUp, Award, Clock,
  Star, Rocket, Gem, Crown, Target as TargetIcon, Sparkle,
  LogIn, LogOut, User, Database, Menu, X, Smartphone,
  Tablet, Monitor
} from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjgNwTgsF2BAP_J6dH7PB7frH0u5xWKm0",
  authDomain: "habit-tracker-12dad.firebaseapp.com",
  projectId: "habit-tracker-12dad",
  storageBucket: "habit-tracker-12dad.firebasestorage.app",
  messagingSenderId: "514551034038",
  appId: "1:514551034038:web:f15f9a53a553de56dfb617",
  measurementId: "G-WDEWQZHT28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [year, setYear] = useState(new Date().getFullYear());
  const [weekStartsOn, setWeekStartsOn] = useState('Monday');
  const [habits, setHabits] = useState([
    { id: 1, name: 'Wake up at 4am', emoji: '⏰', target: 28, color: 'from-purple-500 to-indigo-600', streak: 7 },
    { id: 2, name: 'Meditation (30m)', emoji: '🧘', target: 25, color: 'from-violet-500 to-purple-600', streak: 5 },
    { id: 3, name: 'Running 3km (7am)', emoji: '🏃', target: 20, color: 'from-indigo-500 to-blue-600', streak: 12 },
    { id: 4, name: 'Workout', emoji: '💪', target: 22, color: 'from-purple-500 to-pink-600', streak: 8 },
    { id: 5, name: 'Read Paper', emoji: '📰', target: 25, color: 'from-purple-600 to-violet-600', streak: 14 },
    { id: 6, name: 'Learn Java (New)', emoji: '☕', target: 22, color: 'from-indigo-600 to-purple-600', streak: 3 },
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
  const [syncStatus, setSyncStatus] = useState('ready');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Firebase Authentication
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSyncStatus('saved');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setSyncStatus('error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSyncStatus('ready');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Save data to Firebase
  const saveToFirebase = async (dataType, data) => {
    if (!user) return;
    
    try {
      setSyncStatus('saving');
      const userRef = doc(db, 'users', user.uid);
      const userData = await getDoc(userRef);
      
      if (userData.exists()) {
        await updateDoc(userRef, {
          [`${dataType}`]: data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        await setDoc(userRef, {
          habits: habits,
          emojiLevels: emojiLevels,
          completions: completions,
          year: year,
          weekStartsOn: weekStartsOn,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus(''), 2000);
      
      // Also save to localStorage as backup
      localStorage.setItem(`habitTracker_${dataType}`, JSON.stringify(data));
    } catch (error) {
      console.error('Firebase save error:', error);
      setSyncStatus('error');
      // Fallback to localStorage
      localStorage.setItem(`habitTracker_${dataType}`, JSON.stringify(data));
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus(''), 2000);
    }
  };

  // Load data from Firebase
  const loadFromFirebase = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userData = await getDoc(userRef);
      
      if (userData.exists()) {
        const data = userData.data();
        if (data.habits) setHabits(data.habits);
        if (data.emojiLevels) setEmojiLevels(data.emojiLevels);
        if (data.completions) setCompletions(data.completions);
        if (data.year) setYear(data.year);
        if (data.weekStartsOn) setWeekStartsOn(data.weekStartsOn);
        setSyncStatus('saved');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Firebase load error:', error);
      // Fallback to localStorage
      loadFromLocalStorage();
      setIsLoading(false);
    }
  };

  // Load data from localStorage
  const loadFromLocalStorage = () => {
    const savedHabits = localStorage.getItem('habitTracker_habits');
    const savedCompletions = localStorage.getItem('habitTracker_completions');
    const savedEmojiLevels = localStorage.getItem('habitTracker_emojiLevels');
    const savedYear = localStorage.getItem('habitTracker_year');
    const savedWeekStartsOn = localStorage.getItem('habitTracker_weekStartsOn');
    
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
    if (savedEmojiLevels) setEmojiLevels(JSON.parse(savedEmojiLevels));
    if (savedYear) setYear(parseInt(savedYear));
    if (savedWeekStartsOn) setWeekStartsOn(savedWeekStartsOn);
  };

  // Save data (with Firebase or localStorage)
  const saveData = (dataType, data) => {
    if (user) {
      saveToFirebase(dataType, data);
    } else {
      localStorage.setItem(`habitTracker_${dataType}`, JSON.stringify(data));
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus(''), 2000);
    }
  };

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
    
    // Load from localStorage first (for immediate display)
    loadFromLocalStorage();
    
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load from Firebase when user signs in
        loadFromFirebase();
      }
    });
    
    return () => unsubscribe();
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
      exportedAt: new Date().toISOString(),
      userEmail: user?.email || 'local-user'
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

  // Sync with Firebase
  const syncWithFirebase = async () => {
    if (!user) {
      alert('Please sign in to sync with cloud');
      return;
    }
    
    try {
      setSyncStatus('saving');
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        habits,
        emojiLevels,
        completions,
        year,
        weekStartsOn,
        lastSynced: new Date().toISOString()
      }, { merge: true });
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
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

  // Mobile menu handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (screenSize === 'mobile') {
      setIsMobileMenuOpen(false);
    }
  };

  // Screen size indicator
  const getScreenSizeIcon = () => {
    switch(screenSize) {
      case 'mobile': return <Smartphone className="text-purple-500" size={16} />;
      case 'tablet': return <Tablet className="text-purple-500" size={16} />;
      default: return <Monitor className="text-purple-500" size={16} />;
    }
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl">
          <div className="flex flex-col gap-4">
            {/* Top Row - Logo and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-md opacity-60"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-indigo-500 p-2 sm:p-3 rounded-2xl">
                      <Crown className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black gradient-text">Royal Habit Tracker</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm sm:text-base text-gray-800 font-medium">{currentDate}</p>
                      <div className="flex items-center gap-1">
                        {getScreenSizeIcon()}
                        <span className="text-xs text-gray-600 hidden sm:inline">({screenSize})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Menu Button */}
              <div className="sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 bg-purple-100 rounded-xl text-purple-600 hover:bg-purple-200 transition-colors"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

              {/* Desktop Controls */}
              <div className="hidden sm:flex items-center gap-3 lg:gap-4">
                {/* Auth Section */}
                <div className="hidden lg:flex items-center gap-3">
                  {user ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl">
                        <User size={14} />
                        <span className="text-xs">{user.email?.split('@')[0]}</span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="p-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-shadow"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={signInWithGoogle}
                      className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
                    >
                      <LogIn size={14} />
                      <span className="hidden lg:inline">Sign in</span>
                    </button>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Clock className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
                    <div className="text-lg sm:text-xl font-bold text-gray-900">{currentTime}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 flex-1 bg-purple-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
                        style={{ width: `${getTodayPercentage()}%` }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">
                      {getTotalCompletedToday()}/{habits.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="sm:hidden bg-purple-50 rounded-xl p-4 animate-slideDown">
                <div className="flex flex-col gap-3">
                  {/* Mobile Tabs */}
                  <div className="flex bg-purple-100 rounded-xl p-1">
                    {['dashboard', 'tracker', 'setup'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                          activeTab === tab
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                            : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {tab === 'dashboard' && <LayoutDashboard size={14} />}
                          {tab === 'tracker' && <Calendar size={14} />}
                          {tab === 'setup' && <Settings size={14} />}
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Mobile Auth */}
                  <div className="flex gap-2">
                    {user ? (
                      <>
                        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg">
                          <User size={14} />
                          <span className="text-xs truncate">{user.email?.split('@')[0]}</span>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-lg"
                        >
                          <LogOut size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={signInWithGoogle}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                      >
                        <LogIn size={14} />
                        <span>Sign in with Google</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Sync Status */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      syncStatus === 'saving' ? 'bg-yellow-400 animate-pulse' :
                      syncStatus === 'saved' ? 'bg-green-400' :
                      syncStatus === 'error' ? 'bg-red-400' :
                      'bg-purple-400'
                    }`}></div>
                    <span className="text-xs text-gray-600">
                      {syncStatus === 'saving' ? 'Syncing...' : 
                       syncStatus === 'saved' ? user ? 'Synced' : 'Saved' :
                       syncStatus === 'error' ? 'Sync failed' :
                       user ? 'Connected' : 'Ready'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Row - Quote and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-purple-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg">
                    <Sparkle className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{quote}</h2>
                    <p className="text-sm sm:text-base text-gray-700 font-medium mt-1">
                      {user 
                        ? `Your royal data is safely stored in the cloud!` 
                        : `Sign in to sync across devices.`}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Desktop Tabs and Controls */}
              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                <div className="flex bg-purple-100 rounded-xl p-1">
                  {['dashboard', 'tracker', 'setup'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all duration-300 ${
                        activeTab === tab
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-1 lg:gap-2">
                        {tab === 'dashboard' && <LayoutDashboard size={14} className="lg:w-4 lg:h-4" />}
                        {tab === 'tracker' && <Calendar size={14} className="lg:w-4 lg:h-4" />}
                        {tab === 'setup' && <Settings size={14} className="lg:w-4 lg:h-4" />}
                        <span className="hidden lg:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                        <span className="lg:hidden">{tab.charAt(0).toUpperCase()}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={year}
                      onChange={(e) => {
                        setYear(parseInt(e.target.value));
                        saveData('year', parseInt(e.target.value));
                      }}
                      className="appearance-none px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg lg:rounded-xl text-xs lg:text-sm shadow hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map(y => (
                        <option key={y} value={y} className="bg-white text-gray-800">{y}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white w-3 h-3 lg:w-4 lg:h-4" />
                  </div>
                  
                  {user && (
                    <button
                      onClick={syncWithFirebase}
                      className="px-3 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold rounded-lg lg:rounded-xl hover:shadow-lg transition-shadow flex items-center gap-1"
                      disabled={syncStatus === 'saving'}
                    >
                      <RefreshCw size={14} className={syncStatus === 'saving' ? 'animate-spin' : ''} />
                      <span className="hidden lg:inline">Sync</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Mobile Controls */}
              <div className="sm:hidden flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <select
                    value={year}
                    onChange={(e) => {
                      setYear(parseInt(e.target.value));
                      saveData('year', parseInt(e.target.value));
                    }}
                    className="appearance-none w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg text-xs shadow"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y} className="bg-white text-gray-800">{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white w-3 h-3" />
                </div>
                
                {user && (
                  <button
                    onClick={syncWithFirebase}
                    className="px-3 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold rounded-lg hover:shadow-lg transition-shadow"
                    disabled={syncStatus === 'saving'}
                  >
                    <RefreshCw size={14} className={syncStatus === 'saving' ? 'animate-spin' : ''} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="glass-card rounded-2xl sm:rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-base sm:text-lg font-medium text-gray-600">Loading your royal data from cloud...</p>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Cloud Status Card */}
                {!user && (
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-dashed border-purple-300">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur-lg opacity-50"></div>
                        <div className="relative p-3 sm:p-4 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                          <Cloud className="text-white w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1">👑 Go Royal Cloud-Powered!</h3>
                        <p className="text-sm sm:text-base text-gray-600">
                          Sign in to save your royal progress across all devices.
                        </p>
                      </div>
                      <button
                        onClick={signInWithGoogle}
                        className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transition-shadow text-sm sm:text-base"
                      >
                        Sign in with Google
                      </button>
                    </div>
                  </div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-purple-400">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur opacity-50"></div>
                        <div className="relative p-2 sm:p-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                          <Target className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600">Progress</div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{getOverallProgress()}%</div>
                      </div>
                    </div>
                    <div className="h-2 sm:h-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
                        style={{ width: `${getOverallProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-violet-400">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full blur opacity-50"></div>
                        <div className="relative p-2 sm:p-3 bg-gradient-to-r from-violet-400 to-purple-400 rounded-xl">
                          <Flame className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600">Current Streak</div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 flex items-center gap-2">
                          {getCurrentStreak()}
                          {getCurrentStreak() > 0 && <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" fill="currentColor" />}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-700">
                      {getCurrentStreak() > 0 ? '🔥 Keep going!' : 'Start today!'}
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-indigo-400">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full blur opacity-50"></div>
                        <div className="relative p-2 sm:p-3 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-xl">
                          <Trophy className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600">Best Streak</div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{getBestStreak()}</div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-600">
                      {getBestStreak() > 0 ? '👑 Your record!' : 'Set record!'}
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-fuchsia-400">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-full blur opacity-50"></div>
                        <div className="relative p-2 sm:p-3 bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-xl">
                          <TrendingUp className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600">Today</div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{getTodayPercentage()}%</div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-700">
                      {getTotalCompletedToday()}/{habits.length} done
                    </div>
                  </div>
                </div>

                {/* Performance Graph */}
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 sm:p-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl">
                        <BarChart3 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900">Performance Overview</h2>
                        <p className="text-sm sm:text-base text-gray-700 font-medium">
                          {new Date(year, currentMonth).toLocaleString('default', { month: 'long' })} Progress
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="text-yellow-400 fill-current w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base font-bold text-gray-700">Habits: {habits.length}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {habits.map(habit => {
                      const stats = getHabitStats(habit.id, currentMonth);
                      const progress = Math.min(stats.progress, 100);
                      const emoji = getProgressEmoji(progress);
                      
                      return (
                        <div key={habit.id} className="space-y-2 sm:space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl sm:text-3xl">{habit.emoji}</span>
                              <div>
                                <div className="font-bold text-gray-900 text-sm sm:text-base">{habit.name}</div>
                                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                  <span className="font-medium text-gray-600">
                                    Target: {habit.target}/month
                                  </span>
                                  {stats.currentStreak > 0 && (
                                    <span className="flex items-center gap-1 font-medium text-violet-600">
                                      <Flame size={12} /> {stats.currentStreak}d streak
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                              <div className="text-right">
                                <div className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900">{Math.round(progress)}%</div>
                                <div className="text-xs sm:text-sm font-medium text-gray-600">
                                  {stats.total}/{habit.target} days
                                </div>
                              </div>
                              <span className="text-3xl sm:text-4xl">{emoji}</span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="h-3 sm:h-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${habit.color}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-1 sm:mt-2 text-xs sm:text-sm font-medium">
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
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="group p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur opacity-50 group-hover:blur-xl transition-all"></div>
                          <div className="relative p-3 sm:p-4 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                            <Download className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <div className="font-bold text-gray-900 text-base sm:text-lg mb-1">Export Data</div>
                          <div className="text-sm text-gray-600">
                            Download your progress
                          </div>
                        </div>
                        <button
                          onClick={exportData}
                          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold rounded-lg hover:shadow-lg transition-shadow text-sm"
                        >
                          Export
                        </button>
                      </div>
                    </div>
                    
                    <div className="group p-4 sm:p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl sm:rounded-2xl border border-violet-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-xl blur opacity-50 group-hover:blur-xl transition-all"></div>
                          <div className="relative p-3 sm:p-4 bg-gradient-to-r from-violet-400 to-purple-400 rounded-xl">
                            <Upload className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <div className="font-bold text-gray-900 text-base sm:text-lg mb-1">Import Data</div>
                          <div className="text-sm text-gray-700">
                            Restore from backup
                          </div>
                        </div>
                        <label className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-violet-400 to-purple-400 text-white font-bold rounded-lg hover:shadow-lg transition-shadow cursor-pointer text-center text-sm">
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

                    <div className="group p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur opacity-50 group-hover:blur-xl transition-all"></div>
                          <div className="relative p-3 sm:p-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl">
                            <Database className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <div className="font-bold text-gray-900 text-base sm:text-lg mb-1">Cloud Sync</div>
                          <div className="text-sm text-gray-700">
                            {user ? 'Synced to cloud' : 'Sign in to sync'}
                          </div>
                        </div>
                        {user ? (
                          <button
                            onClick={syncWithFirebase}
                            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold rounded-lg hover:shadow-lg transition-shadow text-sm"
                          >
                            Sync Now
                          </button>
                        ) : (
                          <button
                            onClick={signInWithGoogle}
                            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold rounded-lg hover:shadow-lg transition-shadow text-sm"
                          >
                            Sign In
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tracker Tab */}
            {activeTab === 'tracker' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden">
                  <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-white w-6 h-6 sm:w-7 sm:h-7" />
                        <div>
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white">Habit Tracker</h2>
                          <p className="text-white/90 text-sm sm:text-base">
                            {new Date(year, currentMonth).toLocaleString('default', { month: 'long' })} {year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
                        <TargetIcon className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-white font-bold text-xs sm:text-sm">Tap days to mark habits</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Responsive Tracker Table */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px] sm:min-w-full">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-purple-100">
                            <th className="text-left p-3 sm:p-4 lg:p-6 font-black text-gray-700 sticky left-0 bg-gradient-to-r from-white to-purple-50 z-10">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg">
                                  <Calendar className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <span className="text-sm sm:text-base lg:text-lg">Habits</span>
                              </div>
                            </th>
                            {Array.from({ length: getDaysInMonth(currentMonth, year) }, (_, i) => i + 1).map(day => {
                              const isToday = day === currentDay && year === currentYear && currentMonth === today.getMonth();
                              const dayOfWeek = getDayOfWeek(day, currentMonth, year);
                              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                              
                              return (
                                <th
                                  key={day}
                                  className={`text-center p-1.5 sm:p-2 lg:p-3 font-bold ${
                                    isToday 
                                      ? 'bg-gradient-to-r from-purple-400 to-indigo-400 text-white' 
                                      : isWeekend
                                      ? 'text-purple-400'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  <div className="text-xs sm:text-sm lg:text-base">{day}</div>
                                  <div className="text-[10px] sm:text-xs font-medium">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayOfWeek]}
                                  </div>
                                </th>
                              );
                            })}
                            <th className="text-center p-3 sm:p-4 lg:p-6 font-black text-gray-700 bg-gradient-to-r from-white to-purple-50 sticky right-0">
                              <span className="text-sm sm:text-base">Stats</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {habits.slice(0, showHiddenRows ? habits.length : (screenSize === 'mobile' ? 5 : 7)).map((habit) => {
                            const stats = getHabitStats(habit.id, currentMonth);
                            const emoji = getProgressEmoji(stats.progress);
                            
                            return (
                              <tr key={habit.id} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                                <td className="p-3 sm:p-4 lg:p-6 sticky left-0 bg-gradient-to-r from-white to-purple-50 z-10">
                                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                    <div className="relative">
                                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur opacity-50"></div>
                                      <span className="relative text-xl sm:text-2xl lg:text-3xl">{habit.emoji}</span>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-gray-800 text-sm sm:text-base truncate">{habit.name}</div>
                                      <div className="text-xs sm:text-sm font-medium text-gray-600">
                                        Target: {habit.target}
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
                                    <td key={day} className="p-0.5 sm:p-1 lg:p-2">
                                      <button
                                        onClick={() => !isFuture && toggleCompletion(habit.id, day, currentMonth)}
                                        disabled={isFuture}
                                        className={`
                                          w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200
                                          ${isCompleted
                                            ? 'bg-gradient-to-br from-purple-400 to-indigo-400 text-white shadow hover:shadow-lg'
                                            : isToday
                                            ? 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 shadow'
                                            : 'bg-gradient-to-br from-purple-50 to-indigo-50 text-gray-500 hover:shadow'
                                          }
                                          ${isFuture ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                                        `}
                                      >
                                        {isCompleted ? (
                                          <CheckCircle2 size={screenSize === 'mobile' ? 16 : 20} strokeWidth={2.5} />
                                        ) : isFuture ? (
                                          <span className="text-xs font-bold">-</span>
                                        ) : (
                                          <span className="text-base sm:text-lg font-bold">+</span>
                                        )}
                                      </button>
                                    </td>
                                  );
                                })}
                                
                                <td className="p-3 sm:p-4 lg:p-6 sticky right-0 bg-gradient-to-r from-white to-purple-50">
                                  <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-600 text-xs sm:text-sm">Total:</span>
                                      <span className="font-black text-gray-800 text-base sm:text-lg lg:text-xl">{stats.total}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-600 text-xs sm:text-sm">Streak:</span>
                                      <div className="flex items-center gap-1">
                                        <Flame size={14} className={stats.currentStreak > 0 ? 'text-violet-400' : 'text-purple-400'} />
                                        <span className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg">{stats.currentStreak}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-600 text-xs sm:text-sm">Progress:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl sm:text-2xl">{emoji}</span>
                                        <span className="font-black text-gray-800 text-base sm:text-lg lg:text-xl">{Math.round(stats.progress)}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {habits.length > (screenSize === 'mobile' ? 5 : 7) && !showHiddenRows && (
                      <div className="p-4 sm:p-6 text-center bg-gradient-to-r from-purple-50 to-indigo-50">
                        <button
                          onClick={() => setShowHiddenRows(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-sm sm:text-base"
                        >
                          <ChevronDown size={18} />
                          Show {habits.length - (screenSize === 'mobile' ? 5 : 7)} more habits
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile Tracker Alternative */}
                  {screenSize === 'mobile' && (
                    <div className="p-4">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-lg">
                          <TargetIcon className="text-purple-600 w-4 h-4" />
                          <span className="text-sm font-medium text-purple-700">Scroll horizontally to see all days</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {habits.map(habit => {
                          const stats = getHabitStats(habit.id, currentMonth);
                          const emoji = getProgressEmoji(stats.progress);
                          
                          return (
                            <div key={habit.id} className="bg-white rounded-xl p-3 border border-purple-100 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{habit.emoji}</span>
                                  <span className="font-bold text-gray-800 text-sm truncate">{habit.name}</span>
                                </div>
                                <span className="text-xl">{emoji}</span>
                              </div>
                              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full bg-gradient-to-r ${habit.color}`}
                                  style={{ width: `${Math.min(stats.progress, 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-2 text-xs">
                                <span className="text-gray-600">{stats.total}/{habit.target}</span>
                                <span className="font-bold text-purple-600">{Math.round(stats.progress)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Summary */}
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800 mb-4 sm:mb-6">Monthly Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
                        <h3 className="font-bold text-gray-700 text-sm sm:text-base">Top Performers</h3>
                      </div>
                      {habits
                        .map(habit => ({ ...habit, stats: getHabitStats(habit.id, currentMonth) }))
                        .sort((a, b) => b.stats.progress - a.stats.progress)
                        .slice(0, 3)
                        .map((habit, index) => (
                          <div key={habit.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg font-bold text-white text-xs sm:text-sm">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl sm:text-2xl">{habit.emoji}</span>
                                <span className="font-medium text-sm sm:text-base truncate">{habit.name}</span>
                              </div>
                            </div>
                            <span className="font-black text-purple-600 text-base sm:text-lg lg:text-xl">
                              {Math.round(habit.stats.progress)}%
                            </span>
                          </div>
                        ))}
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TargetIcon className="text-violet-400 w-5 h-5 sm:w-6 sm:h-6" />
                        <h3 className="font-bold text-gray-700 text-sm sm:text-base">Need Attention</h3>
                      </div>
                      {habits
                        .map(habit => ({ ...habit, stats: getHabitStats(habit.id, currentMonth) }))
                        .sort((a, b) => a.stats.progress - b.stats.progress)
                        .slice(0, 3)
                        .map((habit, index) => (
                          <div key={habit.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gradient-to-r from-violet-400 to-purple-400 rounded-lg font-bold text-white text-xs sm:text-sm">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl sm:text-2xl">{habit.emoji}</span>
                                <span className="font-medium text-sm sm:text-base truncate">{habit.name}</span>
                              </div>
                            </div>
                            <span className="font-black text-violet-600 text-base sm:text-lg lg:text-xl">
                              {Math.round(habit.stats.progress)}%
                            </span>
                          </div>
                        ))}
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Flame className="text-fuchsia-400 w-5 h-5 sm:w-6 sm:h-6" />
                        <h3 className="font-bold text-gray-700 text-sm sm:text-base">Current Streaks</h3>
                      </div>
                      {habits
                        .map(habit => ({ ...habit, stats: getHabitStats(habit.id, currentMonth) }))
                        .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak)
                        .slice(0, 3)
                        .map((habit, index) => (
                          <div key={habit.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-fuchsia-50 to-purple-50 rounded-xl border border-fuchsia-200">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-lg font-bold text-white text-xs sm:text-sm">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2">
                                <Flame size={16} className={habit.stats.currentStreak > 0 ? 'text-fuchsia-400' : 'text-purple-400'} />
                                <span className="font-medium text-sm sm:text-base truncate">{habit.name}</span>
                              </div>
                            </div>
                            <span className="font-black text-fuchsia-600 text-base sm:text-lg lg:text-xl">
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
              <div className="space-y-4 sm:space-y-6">
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur opacity-50"></div>
                        <div className="relative p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                          <Settings className="text-white w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800">Habit Configuration</h2>
                        <p className="text-violet-600 font-medium text-sm sm:text-base mt-1">
                          Customize your habits and progress settings
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-black gradient-text">{habits.length}</div>
                      <div className="text-xs sm:text-sm font-bold text-gray-600">Total Habits</div>
                    </div>
                  </div>
                  
                  {/* Add New Habit */}
                  <div className="mb-6 sm:mb-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-purple-300">
                    <h3 className="font-black text-gray-800 text-base sm:text-lg lg:text-xl mb-4 flex items-center gap-2">
                      <Plus className="text-purple-500 w-5 h-5" />
                      Add New Habit
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                          Habit Name
                        </label>
                        <input
                          type="text"
                          value={newHabit.name}
                          onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                          placeholder="e.g., Drink 2L water daily"
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4 border-2 border-purple-300 rounded-lg sm:rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                          Emoji
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={newHabit.emoji}
                            onChange={(e) => setNewHabit({...newHabit, emoji: e.target.value})}
                            placeholder="✨"
                            maxLength="2"
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4 border-2 border-purple-300 rounded-lg sm:rounded-xl bg-white text-center text-2xl sm:text-3xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                            Monthly Target
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={newHabit.target}
                            onChange={(e) => setNewHabit({...newHabit, target: parseInt(e.target.value) || 20})}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4 border-2 border-purple-300 rounded-lg sm:rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm sm:text-base"
                          />
                        </div>
                        <button
                          onClick={addHabit}
                          className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transition-all"
                        >
                          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Habit List */}
                  <div className="space-y-3 sm:space-y-4">
                    {habits.map((habit) => {
                      const stats = getHabitStats(habit.id, currentMonth);
                      
                      return (
                        <div key={habit.id} className="flex items-center gap-3 p-3 sm:p-4 lg:p-6 border-2 border-purple-100 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all">
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-500 hover:text-purple-600 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                value={habit.emoji}
                                onChange={(e) => updateHabit(habit.id, 'emoji', e.target.value)}
                                maxLength="2"
                                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-2xl sm:text-3xl text-center border-2 border-purple-300 rounded-lg sm:rounded-xl bg-white flex-shrink-0"
                              />
                              <input
                                type="text"
                                value={habit.name}
                                onChange={(e) => updateHabit(habit.id, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border-2 border-purple-300 rounded-lg sm:rounded-xl bg-white text-sm sm:text-base"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2">
                                Monthly Target
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="31"
                                value={habit.target}
                                onChange={(e) => updateHabit(habit.id, 'target', e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-purple-300 rounded-lg sm:rounded-xl bg-white text-sm sm:text-base"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2">
                                Current Progress
                              </label>
                              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                <div className="flex-1">
                                  <div className="h-2 sm:h-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full bg-gradient-to-r ${habit.color}`}
                                      style={{ width: `${Math.min(stats.progress, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="font-black text-gray-800 text-base sm:text-lg lg:text-xl">{Math.round(stats.progress)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Emoji Levels Configuration */}
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                      <Gem className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800">Progress Emoji Levels</h2>
                      <p className="text-violet-600 font-medium text-sm sm:text-base mt-1">
                        Set emojis for different completion percentages
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {emojiLevels.map((level, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 lg:p-6 border-2 border-purple-100 rounded-xl sm:rounded-2xl">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                              Threshold (%)
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
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-purple-300 rounded-lg sm:rounded-xl bg-white text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                              Display Emoji
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
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-purple-300 rounded-lg sm:rounded-xl bg-white text-2xl sm:text-3xl text-center"
                            />
                          </div>
                        </div>
                        <div className="text-center w-full sm:w-auto">
                          <div className="text-3xl sm:text-4xl lg:text-5xl mb-1 sm:mb-2">{level.emoji}</div>
                          <div className="text-xs sm:text-sm font-bold text-gray-600">
                            ≥{level.threshold}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setEmojiLevels([...emojiLevels, { threshold: 0, emoji: '✨', color: 'from-gray-400 to-gray-300' }])}
                    className="mt-4 sm:mt-6 px-4 py-3 sm:px-6 sm:py-4 border-2 border-dashed border-purple-300 rounded-lg sm:rounded-xl text-purple-600 font-bold hover:border-purple-400 transition-colors w-full text-sm sm:text-base"
                  >
                    + Add New Emoji Level
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl blur opacity-50"></div>
                <div className="relative p-2 sm:p-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl">
                  <Crown className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div>
                <div className="font-black text-gray-800 text-sm sm:text-base">Built for Royal Discipline & Growth</div>
                <div className="text-violet-600 font-medium text-xs sm:text-sm">
                  {user ? `Synced as ${user.email?.split('@')[0]}` : 'Track your royal journey'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
              <div className="text-center">
                <div className="flex items-center gap-1 text-violet-500 font-black text-sm sm:text-base lg:text-lg">
                  <Flame className="w-4 h-4" fill="currentColor" />
                  {getCurrentStreak()} DAY STREAK
                </div>
                <div className="text-gray-600 font-bold text-xs sm:text-sm">
                  {getTotalCompletedToday()}/{habits.length} DONE TODAY
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
                <div className="font-mono font-black text-gray-800 text-base sm:text-lg lg:text-xl">
                  {currentTime}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Device Info */}
          <div className="mt-4 pt-4 border-t border-purple-200 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
              {getScreenSizeIcon()}
              <span className="text-xs text-gray-600">Optimized for {screenSize}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;