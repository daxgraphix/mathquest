/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Star, 
  Gamepad2, 
  Users, 
  Flag, 
  Construction, 
  Rocket, 
  ChevronLeft,
  Play,
  LogOut,
  Settings,
  X,
  Calendar,
  Check,
  Zap,
  Clock,
  Shield,
  ArrowRight,
  Target,
  Swords,
  Home,
  Sun,
  Moon,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { audioManager } from './lib/audio';
import { Player, GameType, Difficulty, Mission } from './types';
import { loginPlayer, fetchLeaderboard, saveScore, updatePlayerProfile } from './services/api';
import { DAILY_MISSIONS, WEEKLY_MISSIONS, SPECIAL_MISSIONS, CHALLENGE_MISSIONS } from './config/missions';
import { Button } from './components/Button';

// --- Components ---
import { GameCard } from './components/GameCard';
import TugOfWarGame from './components/games/TugOfWarGame';
import BridgeGame from './components/games/BridgeGame';
import BattleGame from './components/games/BattleGame';
import ModeSelector from './components/ModeSelector';

export default function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [username, setUsername] = useState('');
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [modeSelectorGame, setModeSelectorGame] = useState<GameType | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [gameMode, setGameMode] = useState<'normal' | 'timed' | 'endless' | 'battle'>('normal');
  const [currentTheme, setCurrentTheme] = useState('default');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Theme gradient configuration
  const themeGradients: Record<string, { from: string; via: string; to: string; primary: string; secondary: string }> = {
    default: { from: 'indigo', via: 'purple', to: 'indigo', primary: '#6366f1', secondary: '#8b5cf6' },
    neon: { from: 'cyan', via: 'pink', to: 'cyan', primary: '#06b6d4', secondary: '#ec4899' },
    jungle: { from: 'green', via: 'emerald', to: 'green', primary: '#22c55e', secondary: '#10b981' },
    ocean: { from: 'blue', via: 'cyan', to: 'blue', primary: '#0ea5e9', secondary: '#06b6d4' },
    sunset: { from: 'orange', via: 'red', to: 'orange', primary: '#f97316', secondary: '#ef4444' },
    galaxy: { from: 'purple', via: 'indigo', to: 'purple', primary: '#a855f7', secondary: '#6366f1' }
  };
  
  const currentGradient = themeGradients[currentTheme] || themeGradients.default;
  
  // Initialize missions from config
  const initialMissions = () => {
    const daily = DAILY_MISSIONS.map(m => ({ ...m, current: 0, completed: false }));
    const weekly = WEEKLY_MISSIONS.map(m => ({ ...m, current: 0, completed: false }));
    const special = SPECIAL_MISSIONS.map(m => ({ ...m, current: 0, completed: false }));
    const challenge = CHALLENGE_MISSIONS.map(m => ({ ...m, current: 0, completed: false }));
    return [...daily, ...weekly, ...special, ...challenge];
  };
  
  const [missions, setMissions] = useState<Mission[]>(initialMissions());
  const [showMissions, setShowMissions] = useState(false);

  // Settings form state
  const [tempAvatar, setTempAvatar] = useState('👦');
  const [tempSpaceColor, setTempSpaceColor] = useState('#22d3ee');
  const [toast, setToast] = useState<{ title: string, reward: number, type?: 'mission' | 'daily' } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    // Initialize audio system
    try {
      audioManager.initialize();
    } catch (e) {
      console.warn('Audio init failed', e);
    }
    
    try {
      const savedPlayer = localStorage.getItem('math_player');
      const hasSeenTutorial = localStorage.getItem('math_tutorial_seen');
      
      if (savedPlayer) {
        const p = JSON.parse(savedPlayer);
        if (!p.abilities) p.abilities = [];
        if (!p.unlocked_themes) p.unlocked_themes = ['default', 'neon', 'jungle', 'ocean', 'sunset', 'galaxy'];
        if (!p.unlocked_accessories) p.unlocked_accessories = [];
        if (p.active_accessory === undefined) p.active_accessory = null;
        if (p.active_theme) setCurrentTheme(p.active_theme);
        // Ensure all games have 20 levels unlocked for existing players
        if (!p.level_progress) p.level_progress = { 'tug-of-war': 20, 'bridge': 20, 'battle': 20 };
        else {
          // Update existing players to have 20 levels unlocked
          p.level_progress = {
            'tug-of-war': 20,
            'bridge': 20,
            'battle': 20,
            ...p.level_progress
          };
        }
        
        setPlayer(p);
        setTempAvatar(p.avatar || '👦');
        setTempSpaceColor(p.space_color || '#22d3ee');

        // Check for Daily Reward
        const lastLogin = localStorage.getItem('math_last_login');
        const today = new Date().toDateString();
        if (lastLogin !== today) {
          const reward = 50;
          setToast({ title: 'Daily Login Reward!', reward, type: 'daily' });
          setTimeout(() => setToast(null), 5000);
          
          const updatedPlayer = { ...p, stars: (p.stars || 0) + reward };
          setPlayer(updatedPlayer);
          localStorage.setItem('math_player', JSON.stringify(updatedPlayer));
          localStorage.setItem('math_last_login', today);
        }
      }
      
      if (!hasSeenTutorial && savedPlayer) {
        setShowTutorial(true);
      }
      
      loadLeaderboard();
      
      const savedMissions = localStorage.getItem('math_missions');
      if (savedMissions) {
        setMissions(JSON.parse(savedMissions));
      }
    } catch (e) {
      console.warn('LocalStorage parse error', e);
    }
  }, []);

  const updateMissions = (score: number, stars: number, stats?: { bosses?: number, distance?: number, problems?: number, segments?: number, races?: number }) => {
    setMissions(prev => {
      const next = prev.map(m => {
        if (m.completed) return m;
        let added = 0;
        if (m.id === '1') added = stats?.bosses || 0;
        if (m.id === '2') added = stats?.distance || 0;
        if (m.id === '3') added = stats?.problems || 0;
        if (m.id === '4') added = stats?.segments || 0;
        if (m.id === '5') added = stats?.races || 0;
        if (m.id === '6') added = 1; // Any game completion counts

        const newCurrent = m.current + added;
        const completed = newCurrent >= m.target;
        
        if (completed && !m.completed) {
          // Reward player
          setToast({ title: m.title, reward: m.reward, type: 'mission' });
          setTimeout(() => setToast(null), 4000);
          
          if (player) {
            const updatedPlayer = { ...player, stars: player.stars + m.reward };
            setPlayer(updatedPlayer);
            localStorage.setItem('math_player', JSON.stringify(updatedPlayer));
          }
        }

        return { ...m, current: newCurrent, completed };
      });
      localStorage.setItem('math_missions', JSON.stringify(next));
      return next;
    });
  };

  const loadLeaderboard = async () => {
    const data = await fetchLeaderboard();
    setLeaderboard(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Initialize audio on first interaction
    audioManager.resume();
    audioManager.playClick();
    
    const data = await loginPlayer(username);
    
    // Ensure level_progress exists with all games at level 20
    if (!data.level_progress) {
      data.level_progress = {
        'tug-of-war': 20,
        'racing': 20,
        'bridge': 20,
        'space': 20,
        'battle': 20
      };
    } else {
      // Ensure all games have at least 20 levels unlocked
      data.level_progress = {
        'tug-of-war': 20,
        'racing': 20,
        'bridge': 20,
        'space': 20,
        'battle': 20,
        ...data.level_progress
      };
    }

    if (!data.abilities) data.abilities = [];
    if (!data.unlocked_themes) data.unlocked_themes = ['default'];
    if (!data.unlocked_accessories) data.unlocked_accessories = [];
    if (data.active_accessory === undefined) data.active_accessory = null;
    
    setPlayer(data);
    localStorage.setItem('math_player', JSON.stringify(data));
    
    const hasSeenTutorial = localStorage.getItem('math_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  };

  const handleLogout = () => {
    setPlayer(null);
    localStorage.removeItem('math_player');
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleUpdateProfile = async () => {
    if (!player) return;
    const updated = await updatePlayerProfile(player.id, tempAvatar, tempSpaceColor);
    if (updated) {
      const withTheme = { ...updated, active_theme: currentTheme, unlocked_themes: ['default', 'neon', 'jungle', 'ocean', 'sunset', 'galaxy'] };
      setPlayer(withTheme);
      localStorage.setItem('math_player', JSON.stringify(withTheme));
    }
    setShowSettings(false);
    setToast({ title: 'Settings Saved!', reward: 0 });
  };

  const onGameComplete = async (score: number, stars: number, stats?: { bosses?: number, distance?: number, problems?: number, segments?: number, races?: number }) => {
    if (player) {
      // Scale score based on difficulty
      const diffMultiplier = difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1;
      const modeMultiplier = gameMode === 'endless' ? 1.5 : gameMode === 'timed' ? 1.2 : 1;
      const abilityMultiplier = player.abilities.includes('double_stars') ? 2 : 1;
      
      const multiplier = diffMultiplier * modeMultiplier * abilityMultiplier;
      const finalScore = Math.floor(score * multiplier);
      const finalStars = Math.floor(stars * multiplier);

      await saveScore(player.id, activeGame!, finalScore, finalStars);
      
      const updatedPlayer = { ...player, total_score: player.total_score + finalScore, stars: player.stars + finalStars };
      
      // All levels are already unlocked - no progression needed
      if (activeGame) {
        // All 20 levels are available from the start
      }

      setPlayer(updatedPlayer);
      localStorage.setItem('math_player', JSON.stringify(updatedPlayer));
      
      updateMissions(finalScore, finalStars, stats);
      loadLeaderboard();
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b']
      });
    }
    setActiveGame(null);
  };

  const handleStartGame = (game: GameType) => {
    // Go directly to game without showing mode selector
    setIsLoadingGame(true);
    setGameMode('normal');
    setSelectedGameForMode(game);
    setTimeout(() => {
      setActiveGame(game);
      setModeSelectorGame(null);
      setIsLoadingGame(false);
    }, 300);
  };

  const [selectedGameForMode, setSelectedGameForMode] = useState<GameType | null>(null);

  const handleSelectMode = (mode: 'campaign' | 'challenge' | 'practice', options?: any) => {
    setIsLoadingGame(true);
    
    // Set game mode based on selection
    if (mode === 'challenge' && options) {
      setGameMode(options.timeLimit ? 'timed' : 'endless');
      if (options.difficulty) setDifficulty(options.difficulty);
      if (options.timeLimit) setTimeLimit(options.timeLimit);
    } else if (mode === 'practice' && options) {
      setGameMode('normal');
      if (options.difficulty) setDifficulty(options.difficulty);
    } else {
      setGameMode('normal');
    }
    
    // Set campaign level if in campaign mode
    if (mode === 'campaign' && options?.level) {
      // Could set level-specific settings here
    }
    
    setTimeout(() => {
      setModeSelectorGame(null);
      setActiveGame(selectedGameForMode);
      setSelectedGameForMode(null);
      setIsLoadingGame(false);
    }, 500);
  };

  // Render game component
  const renderGame = () => {
    if (!activeGame) return null;
    
    const gameProps = {
      onComplete: onGameComplete,
      difficulty,
      gameMode,
      player: player,
      timeLimit
    };

    switch (activeGame) {
      case 'tug-of-war':
        return <TugOfWarGame {...gameProps} />;
      case 'bridge':
        return <BridgeGame {...gameProps} />;
      case 'battle':
        return <BattleGame {...gameProps} />;
      default:
        return null;
    }
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-slate-950" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          
          {/* Animated Orbs */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          />
          
          {/* Floating Math Symbols */}
          {['+', '−', '×', '÷', '=', 'π', '∑', '∫', '√', '∞'].map((symbol, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: [0, 0.3, 0],
                y: [0, -100],
                x: [0, Math.sin(i) * 30],
                rotate: [0, 180]
              }}
              transition={{ 
                duration: 3 + i * 0.3, 
                repeat: Infinity,
                delay: i * 0.4
              }}
              className="absolute text-2xl font-bold text-indigo-400/40"
              style={{ 
                left: `${8 + (i * 9)}%`, 
                top: `${55 + (i % 4) * 12}%`,
                fontSize: `${1.2 + (i % 3) * 0.4}rem`
              }}
            >
              {symbol}
            </motion.div>
          ))}
          
          {/* Stars */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ 
                duration: 1.5 + Math.random() * 2, 
                repeat: Infinity,
                delay: Math.random() * 3
              }}
              className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-lg"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 80}%` 
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative z-10 text-center"
        >
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            className="relative inline-block mb-8"
          >
            <div className="w-40 h-40 mx-auto rounded-[3rem] flex items-center justify-center border-4 border-white/20"
              style={{ background: `linear-gradient(135deg, ${currentGradient.primary}, ${currentGradient.secondary}, ${currentGradient.primary})`, boxShadow: `0 0 60px ${currentGradient.primary}80` }}>
              <Trophy className="text-white w-20 h-20" />
            </div>
            {/* Glow Ring */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-[3rem] border-2 border-indigo-400/50"
            />
            {/* Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  x: [0, Math.cos(i * Math.PI / 4) * 20],
                  y: [0, Math.sin(i * Math.PI / 4) * 20]
                }}
                transition={{ 
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
                className="absolute w-2 h-2 bg-white rounded-full shadow-white/50"
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-4px',
                  marginLeft: '-4px'
                }}
              />
            ))}
          </motion.div>

          {/* Title Animation */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-6xl sm:text-7xl font-black text-white mb-4"
          >
            Math<span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${currentGradient.primary}, ${currentGradient.secondary})` }}>Quest</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-400 text-lg sm:text-xl font-medium mb-8"
          >
            Master Math Through Play
          </motion.p>

          {/* Feature Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-wrap justify-center gap-2 mb-8 px-4"
          >
            {['🧮 Mental Math', '⚡ Speed', '🏆 Tournaments', '🎮 Fun'].map((feature, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="px-3 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-slate-300 text-xs sm:text-sm whitespace-nowrap"
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>

          {/* Loading Bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: 1.5 }}
            className="w-64 mx-auto"
          >
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full" />
          </motion.div>

          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={() => setShowSplash(false)}
            className="mt-8 text-slate-500 text-sm hover:text-white transition-colors"
          >
            Skip →
          </motion.button>
        </motion.div>

        {/* Auto dismiss after animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          onAnimationComplete={() => setShowSplash(false)}
          className="hidden"
        />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Main gradient orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15],
              x: [0, 50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/3 -left-1/4 w-[600px] h-[600px] bg-indigo-600/30 blur-[150px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.25, 0.15],
              x: [0, -30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1/3 -right-1/4 w-[500px] h-[500px] bg-purple-600/30 blur-[150px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 18, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full"
          />
          
          {/* Floating math symbols */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: '110vh', 
                x: Math.random() * 100 + 'vw', 
                opacity: 0, 
                rotate: Math.random() * 360 
              }}
              animate={{ 
                y: '-20vh', 
                opacity: [0, 0.15, 0],
                rotate: Math.random() * 360 + 180
              }}
              transition={{ 
                duration: 12 + Math.random() * 10, 
                repeat: Infinity, 
                ease: "linear", 
                delay: Math.random() * 8 
              }}
              className="absolute text-white/10 font-black text-5xl sm:text-7xl select-none pointer-events-none"
            >
              {['+', '-', '×', '÷', '=', '?', 'π', 'Σ', '√', '∞', 'Δ', '∑'][i % 12]}
            </motion.div>
          ))}
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo Section */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-10"
          >
            {/* Animated Trophy Icon */}
            <div className="relative inline-block mb-6">
              <motion.div 
                animate={{ 
                  rotate: [0, -8, 8, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-[2rem] flex items-center justify-center shadow-[0_20px_60px_rgba(245,158,11,0.5)] border-4 border-white/20">
                  <Trophy className="text-white w-14 h-14 sm:w-16 sm:h-16 drop-shadow-lg" />
                </div>
                {/* Glow effect */}
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-yellow-400/30 blur-2xl rounded-[2rem]" 
                />
              </motion.div>
              
              {/* Floating decorations */}
              <motion.span
                animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-2 -right-2 text-2xl"
              >
                ⭐
              </motion.span>
              <motion.span
                animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-1 -left-2 text-xl"
              >
                ✨
              </motion.span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
              Math<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">Quest</span>
            </h1>
            <p className="text-indigo-200 font-medium">Master Math Through Play</p>
          </motion.div>

          {/* Login Form */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-2xl"
          >
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2 ml-1">Hero Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-5 py-4 rounded-2xl bg-white/90 border-2 border-transparent focus:border-indigo-400 focus:bg-white text-slate-900 font-bold text-lg outline-none transition-all placeholder:text-slate-400"
                  autoFocus
                />
              </div>
              
              <Button
                type="submit"
                className="w-full py-4 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Adventure
              </Button>
            </form>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex justify-center gap-6 text-white/60"
          >
            <div className="text-center">
              <Gamepad2 className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-medium">6 Games</span>
            </div>
            <div className="text-center">
              <Star className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-medium">Earn Stars</span>
            </div>
            <div className="text-center">
              <Trophy className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-medium">Leaderboards</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${currentGradient.primary}, ${currentGradient.secondary})` }}
              >
                <Trophy className="text-white w-5 h-5" />
              </motion.div>
              <span className="font-black text-xl text-slate-900">MathQuest</span>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="hidden sm:flex items-center gap-3"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 rounded-2xl border border-amber-200/60 shadow-sm hover:shadow-md transition-shadow"
              >
                <Star className="text-amber-500 fill-amber-500 w-4 h-4" />
                <span className="font-black text-amber-600 tabular-nums">{player.stars}</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-2xl border border-indigo-200/60 shadow-sm hover:shadow-md transition-shadow"
              >
                <Trophy className="text-indigo-500 w-4 h-4" />
                <span className="font-black text-indigo-600 tabular-nums">{player.total_score.toLocaleString()}</span>
              </motion.div>
            </motion.div>

            {/* User Section */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-2 sm:gap-4"
            >
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden xs:block">
                  <p className="label-caps text-[8px] text-slate-500 font-semibold">Hero</p>
                  <p className="font-bold text-sm flex items-center gap-1.5">
                    <span className="text-xl relative">
                      {player.avatar}
                      {player.active_accessory && (
                        <span className="absolute -top-2 -right-2 text-xs">
                          {player.active_accessory === 'crown' ? '👑' : 
                           player.active_accessory === 'glasses' ? '👓' : 
                           player.active_accessory === 'cape' ? '🧣' : ''}
                        </span>
                      )}
                    </span>
                    <span className="hidden sm:inline text-slate-700">{player.username}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {modeSelectorGame && (
            <ModeSelector
              gameType={modeSelectorGame}
              onSelectMode={handleSelectMode}
              onBack={() => setModeSelectorGame(null)}
              playerProgress={{
                currentLevel: 20,
                unlockedLevels: 20,
                stars: []
              }}
            />
          )}
          {!modeSelectorGame && !activeGame ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Welcome Banner - Full Width */}
              <motion.div 
                whileHover={{ scale: 1.005 }}
                className="p-6 sm:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${currentGradient.primary}, ${currentGradient.secondary})` }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full -ml-16 -mb-16 blur-3xl" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl sm:text-5xl border-2 border-white/30">
                      {player.avatar}
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Welcome back</p>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">{player.username}</h2>
                      <p className="text-indigo-200 text-sm font-medium">{player.games_played && player.games_played >= 10 ? '🏆 Champion' : player.games_played && player.games_played >= 5 ? '⭐ Hero' : '🌱 Rookie'} • {player.stars} Stars</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setDifficulty(difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'easy')}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                    >
                      <Target className="w-4 h-4" />
                      {difficulty.toUpperCase()}
                    </button>
                    <button 
                      onClick={() => setShowMissions(true)}
                      className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-indigo-950 px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-400/20 transition-all"
                    >
                      <Star className="w-4 h-4" />
                      Missions
                    </button>
                    <button 
                      onClick={() => setShowLeaderboard(true)}
                      className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-indigo-950 px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-amber-400/20 transition-all"
                    >
                      <Trophy className="w-4 h-4" />
                      Rankings
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase">Stars</p>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{player.stars}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-indigo-500" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase">Score</p>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{player.total_score.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase">Games</p>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{player.games_played || 0}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase">Solved</p>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{player.total_problems_solved || 0}</p>
                </div>
              </div>

              {/* Section Title */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Choose Your Game</h3>
                <button 
                  onClick={() => setShowShop(true)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors"
                >
                  <span>Shop</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Games Grid */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
              >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <GameCard 
                    title="Tug of War" 
                    icon={<Users className="w-8 h-8" />}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    description="Quick mental math to pull the rope to your side!"
                    onClick={() => handleStartGame('tug-of-war')}
                    level={player.level_progress?.['tug-of-war']}
                    difficulty={difficulty}
                  />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <GameCard 
                    title="Bridge Puzzle" 
                    icon={<Construction className="w-8 h-8" />}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    description="Build a bridge segment by segment with logic and math."
                    onClick={() => handleStartGame('bridge')}
                    level={player.level_progress?.['bridge']}
                    difficulty={difficulty}
                  />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <GameCard 
                    title="Math Battle" 
                    icon={<Swords className="w-8 h-8" />}
                    color="bg-gradient-to-br from-rose-500 to-rose-600"
                    description="Battle AI opponents with your math skills!"
                    onClick={() => handleStartGame('battle')}
                    level={player.level_progress?.['battle']}
                    difficulty={difficulty}
                  />
                </motion.div>
              </motion.div>

              {showLeaderboard && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-white rounded-[3rem] border-4 border-indigo-100 p-10 mb-12 overflow-hidden shadow-xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black flex items-center gap-3 text-indigo-900">
                      <Trophy className="text-yellow-500 w-8 h-8" /> Global Hall of Fame
                    </h3>
                    <button onClick={() => setShowLeaderboard(false)} className="text-indigo-300 hover:text-indigo-600 font-black uppercase tracking-widest text-xs">Close</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {leaderboard.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-indigo-200 transition-all group">
                        <div className="flex items-center gap-6">
                          <span className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm",
                            i === 0 ? "bg-yellow-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-white text-indigo-300"
                          )}>
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-black text-slate-900 text-lg">{entry.username}</p>
                            <p className="text-slate-500 text-sm font-medium">{entry.games_played} games played</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-2xl text-indigo-600">{entry.total_score.toLocaleString()}</p>
                          <p className="text-slate-400 text-xs font-bold">POINTS</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Game Container */}
        {activeGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-slate-900 z-50 overflow-y-scroll min-h-screen"
          >
            {renderGame()}
          </motion.div>
        )}
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoadingGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-4 sm:p-8 w-full max-w-lg relative z-10 border-4 sm:border-8 border-indigo-100 max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 hover:bg-indigo-50 rounded-full text-indigo-300 transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <h2 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" /> <span className="hidden sm:inline">Hero </span>Settings
              </h2>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 order-2 sm:order-1"
                >
                  <X className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">CANCEL</span>
                  <span className="sm:hidden">Cancel</span>
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  className="flex-1 order-1 sm:order-2"
                >
                  <Check className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">SAVE CHANGES</span>
                  <span className="sm:hidden">Save</span>
                </Button>
              </div>

              <div className="space-y-6 sm:space-y-8 max-h-[60vh] overflow-y-auto pr-2">
                {/* Dark/Light Mode Toggle */}
                <div className="settings-section">
                  <label className="block text-xs sm:text-sm font-black text-indigo-400 uppercase tracking-wider mb-2 sm:mb-4 flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Appearance
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDarkMode(false)}
                      className={cn(
                        "flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-4 font-black text-sm uppercase transition-all flex items-center justify-center gap-2",
                        !darkMode 
                          ? "border-indigo-600 bg-indigo-50 shadow-lg" 
                          : "border-indigo-100 hover:border-indigo-200"
                      )}
                    >
                      <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                      <span className="hidden sm:inline">Light</span>
                    </button>
                    <button
                      onClick={() => setDarkMode(true)}
                      className={cn(
                        "flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-4 font-black text-sm uppercase transition-all flex items-center justify-center gap-2",
                        darkMode 
                          ? "border-indigo-600 bg-slate-800 shadow-lg" 
                          : "border-indigo-100 hover:border-indigo-200"
                      )}
                    >
                      <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                      <span className="hidden sm:inline">Dark</span>
                    </button>
                  </div>
                </div>

                {/* Time Limit Selection */}
                <div className="settings-section">
                  <label className="block text-xs sm:text-sm font-black text-indigo-400 uppercase tracking-wider mb-2 sm:mb-4 flex items-center gap-2">
                    <Timer className="w-4 h-4" /> Challenge Time Limit
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    {[60, 90, 120, 180].map(time => (
                      <button
                        key={time}
                        onClick={() => {
                          setTimeLimit(time);
                        }}
                        className={cn(
                          "flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-4 font-black text-sm uppercase transition-all flex items-center justify-center gap-1 sm:gap-2",
                          timeLimit === time 
                            ? "border-indigo-600 bg-indigo-50 shadow-lg" 
                            : "border-indigo-100 hover:border-indigo-200"
                        )}
                      >
                        <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                        {time}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Selection */}
                <div className="settings-section">
                  <label className="block text-xs sm:text-sm font-black text-indigo-400 uppercase tracking-wider mb-2 sm:mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Choose Your Avatar
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                    {['👦', '👧', '🤖', '🐱', '🐶', '🦁', '🦖', '🦄', '🦸', '🧙', '🧚', '🧛'].map(a => (
                      <button
                        key={a}
                        onClick={() => {
                          setTempAvatar(a);
                        }}
                        className={cn(
                          "text-2xl sm:text-3xl w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-4 transition-all hover:scale-110 active:scale-95",
                          tempAvatar === a ? "border-indigo-600 bg-indigo-50 scale-105 sm:scale-110 shadow-lg" : "border-indigo-50 hover:border-indigo-200"
                        )}
                        style={{ boxShadow: tempAvatar === a ? `0 0 20px ${currentGradient.primary}40` : undefined }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Space Color */}
                <div>
                  <label className="block text-sm font-black text-indigo-400 uppercase tracking-wider mb-4">Spaceship Glow (Space Mission)</label>
                  <div className="flex flex-wrap gap-3">
                    {['#22d3ee', '#f472b6', '#fbbf24', '#a78bfa', '#4ade80', '#f87171'].map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          setTempSpaceColor(c);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-full border-4 transition-all hover:scale-110",
                          tempSpaceColor === c ? "border-indigo-600 scale-110" : "border-white shadow-sm"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="settings-section">
                  <label className="block text-xs sm:text-sm font-black text-indigo-400 uppercase tracking-wider mb-2 sm:mb-4">Active Theme</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { id: 'default', name: 'Default', gradient: 'from-indigo-500 to-purple-500' },
                      { id: 'neon', name: 'Neon Night', gradient: 'from-cyan-500 to-pink-500' },
                      { id: 'jungle', name: 'Jungle', gradient: 'from-green-500 to-emerald-500' },
                      { id: 'ocean', name: 'Ocean', gradient: 'from-blue-500 to-cyan-500' },
                      { id: 'sunset', name: 'Sunset', gradient: 'from-orange-500 to-red-500' },
                      { id: 'galaxy', name: 'Galaxy', gradient: 'from-purple-500 to-indigo-500' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setCurrentTheme(t.id);
                        }}
                        className={cn(
                          "p-2 sm:p-4 rounded-xl sm:rounded-2xl border-4 font-black text-xs uppercase transition-all bg-gradient-to-br hover:scale-105 active:scale-95",
                          t.gradient,
                          currentTheme === t.id ? "border-white scale-105 shadow-lg" : "border-white/20 hover:border-white/60"
                        )}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessory Selection */}
                <div>
                  <label className="block text-sm font-black text-indigo-400 uppercase tracking-wider mb-4">Active Accessory</label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        if (player) {
                          const updated = { ...player, active_accessory: null };
                          setPlayer(updated);
                          localStorage.setItem('math_player', JSON.stringify(updated));
                        }
                      }}
                      className={cn(
                        "text-3xl w-14 h-14 rounded-2xl border-4 transition-all",
                        player?.active_accessory === null ? "border-indigo-600 bg-indigo-50 scale-110" : "border-indigo-50 hover:border-indigo-200"
                      )}
                    >
                      🚫
                    </button>
                    {[
                      { id: 'crown', emoji: '👑' },
                      { id: 'glasses', emoji: '👓' },
                      { id: 'cape', emoji: '🧣' },
                      { id: 'wings', emoji: '🪽' },
                      { id: 'halo', emoji: '😇' },
                      { id: 'shield', emoji: '🛡️' },
                      { id: 'star', emoji: '⭐' },
                      { id: 'lightning', emoji: '⚡' }
                    ].map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          if (player) {
                            const updated = { ...player, active_accessory: acc.id };
                            setPlayer(updated);
                            localStorage.setItem('math_player', JSON.stringify(updated));
                          }
                        }}
                        className={cn(
                          "text-3xl w-14 h-14 rounded-2xl border-4 transition-all hover:scale-110",
                          player?.active_accessory === acc.id ? "border-indigo-600 bg-indigo-50 scale-110 shadow-lg shadow-indigo-500/30" : "border-indigo-50 hover:border-indigo-200"
                        )}
                      >
                        {acc.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShop(false)}
              className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg relative z-10 border-8 border-indigo-100 max-h-[80vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowShop(false)}
                className="absolute top-6 right-6 p-2 hover:bg-indigo-50 rounded-full text-indigo-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                <Star className="text-amber-500" /> Star Shop
              </h2>
              <p className="text-slate-500 font-medium mb-8">Spend your stars to unlock new items!</p>

              <div className="space-y-4 mb-6">
                {[
                  { id: 'crown', name: 'Royal Crown', desc: 'Look like royalty!', cost: 200, emoji: '👑' },
                  { id: 'glasses', name: 'Cool Glasses', desc: 'Super stylish!', cost: 150, emoji: '👓' },
                  { id: 'cape', name: 'Hero Cape', desc: 'Flow in the wind!', cost: 300, emoji: '🧣' },
                  { id: 'double_stars', name: 'Double Stars', desc: '2x stars forever!', cost: 500, emoji: '⭐' },
                ].map(item => {
                  const isOwned = player?.unlocked_accessories?.includes(item.id) || (item.id === 'double_stars' && player?.abilities?.includes('double_stars'));
                  
                  return (
                    <button
                      key={item.id}
                      disabled={isOwned || (player?.stars || 0) < item.cost}
                      onClick={() => {
                        if (player && !isOwned && player.stars >= item.cost) {
                          const updated = { ...player, stars: player.stars - item.cost, unlocked_accessories: [...player.unlocked_accessories, item.id] };
                          setPlayer(updated);
                          localStorage.setItem('math_player', JSON.stringify(updated));
                        }
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4",
                        isOwned ? "border-emerald-100 bg-emerald-50/50 opacity-60" : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50",
                        !isOwned && (player?.stars || 0) < item.cost && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="text-3xl bg-indigo-100 p-2 rounded-xl">{item.emoji}</div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="label-caps !text-[8px]">{item.desc}</p>
                      </div>
                      <div className="text-right">
                        {isOwned ? (
                          <span className="text-[10px] font-black text-emerald-600">OWNED</span>
                        ) : (
                          <span className="text-xs font-black text-amber-600">{item.cost} ★</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setShowShop(false)}
                className="w-full mt-6"
              >
                <X className="w-4 h-4 mr-2" />
                CLOSE SHOP
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Missions Modal */}
      <AnimatePresence>
        {showMissions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMissions(false)}
              className="absolute inset-0 bg-emerald-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setShowMissions(false)}
                className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 hover:bg-emerald-50 rounded-full text-emerald-600 transition-colors z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="p-4 sm:p-8 overflow-y-auto max-h-[85vh]">
                <h2 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" /> 
                  <span className="hidden sm:inline">🎯 </span> Missions
                </h2>

                {/* Daily Missions */}
                <div className="mb-6">
                  <h3 className="text-lg font-black text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    📅 Daily Missions
                  </h3>
                  <div className="space-y-2">
                    {missions.filter(m => m.category === 'daily').map((mission, idx) => (
                      <div key={mission.id} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-black text-slate-900">{mission.title}</p>
                            <p className="text-sm text-slate-600">{mission.description}</p>
                          </div>
                          <span className="bg-amber-400 text-indigo-900 px-2 py-1 rounded-full font-black text-xs">{mission.reward} ★</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                            style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1">{mission.current}/{mission.target}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Missions */}
                <div className="mb-6">
                  <h3 className="text-lg font-black text-purple-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    📆 Weekly Missions
                  </h3>
                  <div className="space-y-2">
                    {missions.filter(m => m.category === 'weekly').map((mission) => (
                      <div key={mission.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-black text-slate-900">{mission.title}</p>
                            <p className="text-sm text-slate-600">{mission.description}</p>
                          </div>
                          <span className="bg-purple-400 text-white px-2 py-1 rounded-full font-black text-xs">{mission.reward} ★</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 transition-all"
                            style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1">{mission.current}/{mission.target}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenge Missions */}
                <div className="mb-6">
                  <h3 className="text-lg font-black text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    🔥 Challenges
                  </h3>
                  <div className="space-y-2">
                    {missions.filter(m => m.category === 'challenge').map((mission) => (
                      <div key={mission.id} className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-black text-slate-900">{mission.title}</p>
                            <p className="text-sm text-slate-600">{mission.description}</p>
                          </div>
                          <span className="bg-red-400 text-white px-2 py-1 rounded-full font-black text-xs">{mission.reward} ★</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-400 to-pink-400 transition-all"
                            style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1">{mission.current}/{mission.target}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowMissions(false)}
                  className="w-full mt-4"
                >
                  <X className="w-4 h-4 mr-2" />
                  CLOSE MISSIONS
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-indigo-950/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border-4 border-indigo-500 relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 p-4 rounded-3xl shadow-xl border-4 border-white">
                <Gamepad2 className="text-white w-10 h-10" />
              </div>

              <div className="mt-6 text-center">
                <h3 className="text-3xl font-black text-indigo-900 mb-4">
                  {tutorialStep === 0 && "Welcome, Hero!"}
                  {tutorialStep === 1 && "Choose Your Quest"}
                  {tutorialStep === 2 && "Complete Missions"}
                  {tutorialStep === 3 && "Climb the Ranks"}
                  {tutorialStep === 4 && "Ready to Play?"}
                </h3>
                <p className="text-indigo-600 font-medium mb-8 leading-relaxed">
                  {tutorialStep === 0 && "Welcome to MathQuest! I'm your guide. Let's show you how to become a Math Master."}
                  {tutorialStep === 1 && "Pick any game to start your adventure. Each game helps you master different math skills!"}
                  {tutorialStep === 2 && "Complete daily missions to earn Stars. Unlock cool avatars and accessories from the Shop!"}
                  {tutorialStep === 3 && "Compete on the leaderboard! The more you play, the higher you climb!"}
                  {tutorialStep === 4 && "You're all set! Have fun becoming the ultimate Math Champion! 🎉"}
                </p>
                
                <div className="flex justify-center gap-2 mb-4">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div 
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        tutorialStep === i ? "bg-indigo-600 w-6" : "bg-indigo-200"
                      )}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.setItem('math_tutorial_seen', 'true');
                      setShowTutorial(false);
                    }}
                    className="flex-1"
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={() => {
                      if (tutorialStep < 4) {
                        setTutorialStep(tutorialStep + 1);
                      } else {
                        localStorage.setItem('math_tutorial_seen', 'true');
                        setShowTutorial(false);
                      }
                    }}
                    className="flex-1"
                  >
                    {tutorialStep < 4 ? "Next" : "Let's Go!"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className={cn(
              "px-6 py-4 rounded-2xl shadow-2xl border-4 flex items-center gap-4",
              toast.type === 'daily' ? "bg-gradient-to-r from-amber-400 to-orange-500 border-amber-300" : 
              toast.type === 'mission' ? "bg-gradient-to-r from-emerald-400 to-teal-500 border-emerald-300" :
              "bg-white border-indigo-100"
            )}>
              <div className="text-3xl">
                {toast.type === 'daily' && '🎁'}
                {toast.type === 'mission' && '🏆'}
                {!toast.type && '⭐'}
              </div>
              <div>
                <p className="font-black text-lg text-slate-900">{toast.title}</p>
                <p className="font-bold text-slate-700">+{toast.reward} Stars!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
