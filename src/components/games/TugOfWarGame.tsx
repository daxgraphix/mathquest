import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMathProblem } from '../../services/api';
import { Player, Difficulty, MathProblem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, Anchor, Play, ArrowLeft, Zap, Timer, Target, Flame, Lock, Check, Skull, Circle, Sparkles, TrendingUp, Users, Gauge, Brain, ArrowRight, CheckCircle2, XCircle, Clock, ChevronRight, Shield, RotateCcw, X, Gem, Award, Medal, Crown, Zap as Lightning, Activity, Sword, Home, Pause, SkipForward } from 'lucide-react';
import { Button } from '../Button';
import GameMenu, { GameMenuButton } from '../GameMenu';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import OnScreenKeyboard from '../OnScreenKeyboard';

type GameState = 'levelselect' | 'intro' | 'playing' | 'finished' | 'levelcomplete' | 'gameover';

const TOTAL_LEVELS = 20;
const QUESTIONS_PER_LEVEL = 55;

interface Level {
  level: number;
  unlocked: boolean;
  stars: number;
  bestScore: number;
  challenge: string;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  operations: string[];
  maxNumber: number;
  description: string;
}

const LEVEL_CONFIG: Level[] = [
  { level: 1, unlocked: true, stars: 0, bestScore: 0, challenge: 'Basic Addition', difficulty: 'beginner', operations: ['add'], maxNumber: 10, description: 'Simple addition (1-10)' },
  { level: 2, unlocked: true, stars: 0, bestScore: 0, challenge: 'Addition Practice', difficulty: 'beginner', operations: ['add'], maxNumber: 15, description: 'Addition up to 15' },
  { level: 3, unlocked: true, stars: 0, bestScore: 0, challenge: 'Easy Subtraction', difficulty: 'beginner', operations: ['subtract'], maxNumber: 15, description: 'Subtraction up to 15' },
  { level: 4, unlocked: true, stars: 0, bestScore: 0, challenge: 'Mixed Basics', difficulty: 'easy', operations: ['add', 'subtract'], maxNumber: 20, description: 'Add & subtract (1-20)' },
  { level: 5, unlocked: true, stars: 0, bestScore: 0, challenge: 'Double Digits', difficulty: 'easy', operations: ['add', 'subtract'], maxNumber: 30, description: 'Numbers up to 30' },
  { level: 6, unlocked: true, stars: 0, bestScore: 0, challenge: 'Introduction to Times', difficulty: 'easy', operations: ['multiply'], maxNumber: 10, description: 'Times tables (1-10)' },
  { level: 7, unlocked: true, stars: 0, bestScore: 0, challenge: 'Multiplication Master', difficulty: 'medium', operations: ['multiply'], maxNumber: 12, description: 'Full times tables' },
  { level: 8, unlocked: true, stars: 0, bestScore: 0, challenge: 'Mixed Operations I', difficulty: 'medium', operations: ['add', 'subtract', 'multiply'], maxNumber: 15, description: 'Add, subtract, multiply' },
  { level: 9, unlocked: true, stars: 0, bestScore: 0, challenge: 'Division Basics', difficulty: 'medium', operations: ['divide'], maxNumber: 10, description: 'Simple division' },
  { level: 10, unlocked: true, stars: 0, bestScore: 0, challenge: 'All Four Operations', difficulty: 'medium', operations: ['add', 'subtract', 'multiply', 'divide'], maxNumber: 12, description: '+, -, ×, ÷' },
  { level: 11, unlocked: true, stars: 0, bestScore: 0, challenge: 'Advanced Numbers', difficulty: 'hard', operations: ['add', 'subtract', 'multiply', 'divide'], maxNumber: 25, description: 'Larger numbers' },
  { level: 12, unlocked: true, stars: 0, bestScore: 0, challenge: 'Complex Multiplication', difficulty: 'hard', operations: ['multiply'], maxNumber: 15, description: 'Big multiplication' },
  { level: 13, unlocked: true, stars: 0, bestScore: 0, challenge: 'Two-Step Problems', difficulty: 'hard', operations: ['add', 'subtract', 'multiply', 'divide'], maxNumber: 20, description: 'Two operations' },
  { level: 14, unlocked: true, stars: 0, bestScore: 0, challenge: 'Expert Division', difficulty: 'hard', operations: ['divide', 'multiply'], maxNumber: 15, description: 'Complex division' },
  { level: 15, unlocked: true, stars: 0, bestScore: 0, challenge: 'Mental Math Pro', difficulty: 'expert', operations: ['add', 'subtract', 'multiply', 'divide'], maxNumber: 30, description: 'Fast calculations' },
  { level: 16, unlocked: true, stars: 0, bestScore: 0, challenge: 'Multi-Step Challenge', difficulty: 'expert', operations: ['add', 'subtract', 'multiply', 'divide'], maxNumber: 30, description: 'Multiple steps' },
  { level: 17, unlocked: true, stars: 0, bestScore: 0, challenge: 'Master Level', difficulty: 'expert', operations: ['add', 'subtract', 'multiply', 'divide'], maxNumber: 40, description: 'Large numbers' },
  { level: 18, unlocked: true, stars: 0, bestScore: 0, challenge: 'Ultimate Calculation', difficulty: 'master', operations: ['add', 'subtract', 'multiply', 'divide'], maxNumber: 50, description: 'Expert calculations' },
  { level: 19, unlocked: true, stars: 0, bestScore: 0, challenge: 'Legendary Math', difficulty: 'master', operations: ['add', 'subtract', 'multiply', 'divide'], maxNumber: 50, description: 'Legendary challenge' },
  { level: 20, unlocked: true, stars: 0, bestScore: 0, challenge: 'Math Champion', difficulty: 'master', operations: ['add', 'subtract', 'multiply', 'divide'], maxNumber: 100, description: 'Ultimate champion' }
];

// Generate challenging problems with whole number answers
const generateProblem = (selectedLevel: number): MathProblem => {
  const levelConfig = LEVEL_CONFIG[selectedLevel - 1];
  const maxNum = levelConfig.maxNumber;
  
  const opMap: Record<string, string> = {
    'add': '+',
    'subtract': '-',
    'multiply': '×',
    'divide': '÷'
  };
  
  let num1: number, num2: number, answer: number, question: string;
  
  // For highest levels (15+), add more 3-step and 4-step multi-operation problems
  if (selectedLevel >= 15) {
    const advancedTypes = ['multi-step-3a', 'multi-step-3b', 'multi-step-4a', 'multi-step-4b'];
    const type = advancedTypes[Math.floor(Math.random() * advancedTypes.length)];
    
    switch (type) {
      case 'multi-step-3a': {
        // (a + b) × c + d
        const a = Math.floor(Math.random() * 6) + 2;
        const b = Math.floor(Math.random() * 6) + 2;
        const c = Math.floor(Math.random() * 5) + 2;
        const d = Math.floor(Math.random() * 10) + 1;
        answer = (a + b) * c + d;
        question = `(${a} + ${b}) × ${c} + ${d}`;
        return {
          question,
          answer,
          num1: a,
          num2: b,
          operation: '*' as any,
          difficulty: levelConfig.difficulty as Difficulty
        };
      }
      case 'multi-step-3b': {
        // a × b - c + d
        const a = Math.floor(Math.random() * 6) + 2;
        const b = Math.floor(Math.random() * 6) + 2;
        const c = Math.floor(Math.random() * 8) + 1;
        const d = Math.floor(Math.random() * 10) + 1;
        answer = a * b - c + d;
        question = `${a} × ${b} - ${c} + ${d}`;
        return {
          question,
          answer,
          num1: a,
          num2: b,
          operation: '*' as any,
          difficulty: levelConfig.difficulty as Difficulty
        };
      }
      case 'multi-step-4a': {
        // (a + b) × (c + d)
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 5) + 1;
        const c = Math.floor(Math.random() * 4) + 2;
        const d = Math.floor(Math.random() * 4) + 1;
        answer = (a + b) * (c + d);
        question = `(${a} + ${b}) × (${c} + ${d})`;
        return {
          question,
          answer,
          num1: a,
          num2: b,
          operation: '*' as any,
          difficulty: levelConfig.difficulty as Difficulty
        };
      }
      case 'multi-step-4b': {
        // a × b + c × d
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 5) + 2;
        const c = Math.floor(Math.random() * 5) + 2;
        const d = Math.floor(Math.random() * 5) + 2;
        answer = a * b + c * d;
        question = `${a} × ${b} + ${c} × ${d}`;
        return {
          question,
          answer,
          num1: a,
          num2: b,
          operation: '*' as any,
          difficulty: levelConfig.difficulty as Difficulty
        };
      }
    }
  }
  
  // For higher levels (10-14), create multi-step challenge problems
  if (selectedLevel >= 10) {
    const ops1 = ['add', 'subtract', 'multiply'];
    const ops2 = ['add', 'subtract'];
    
    const op1 = ops1[Math.floor(Math.random() * ops1.length)];
    const op2 = ops2[Math.floor(Math.random() * ops2.length)];
    
    const a = Math.floor(Math.random() * Math.min(10, maxNum / 3)) + 1;
    const b = Math.floor(Math.random() * Math.min(10, maxNum / 3)) + 1;
    const c = Math.floor(Math.random() * Math.min(10, maxNum / 4)) + 1;
    
    if (op1 === 'multiply') {
      const inner = a * b;
      answer = op2 === 'add' ? inner + c : inner - c;
      question = `(${a} × ${b}) ${opMap[op2]} ${c}`;
    } else {
      const inner = op1 === 'add' ? a + b : Math.max(a, b) - Math.min(a, b);
      answer = inner * c;
      question = `(${a} ${opMap[op1]} ${b}) × ${c}`;
    }
    
    return {
      question,
      answer,
      num1: a,
      num2: b,
      operation: 'multiply' as any,
      difficulty: levelConfig.difficulty as Difficulty
    };
  }
  
  const ops = levelConfig.operations;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const opSymbol = opMap[op];
  
  switch (op) {
    case 'add':
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
    case 'subtract':
      num1 = Math.floor(Math.random() * maxNum) + 5;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
      break;
    case 'multiply':
      const multMax = Math.min(maxNum, 12);
      num1 = Math.floor(Math.random() * multMax) + 2;
      num2 = Math.floor(Math.random() * multMax) + 2;
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
      break;
    case 'divide':
      const divMax = Math.min(maxNum, 12);
      num2 = Math.floor(Math.random() * (divMax - 1)) + 2;
      answer = Math.floor(Math.random() * divMax) + 2;
      num1 = num2 * answer;
      question = `${num1} ÷ ${num2}`;
      break;
    default:
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
  }
  
  return {
    question,
    answer,
    num1,
    num2,
    operation: op as any,
    difficulty: levelConfig.difficulty as Difficulty
  };
};

export default function TugOfWarGame({ onComplete, difficulty, player, gameMode, timeLimit }: { onComplete: (score: number, stars: number, stats?: any) => void, difficulty: Difficulty, player: Player | null, gameMode?: 'normal' | 'timed' | 'endless' | 'battle', timeLimit?: number }) {
  const currentLevel = player?.level_progress?.['tug-of-war'] || 1;
  
  const [levels, setLevels] = useState<Level[]>(() => {
    return LEVEL_CONFIG.map((config, i) => ({
      level: config.level,
      unlocked: i === 0 || true,
      stars: 0,
      bestScore: 0,
      challenge: config.challenge,
      difficulty: config.difficulty,
      operations: config.operations,
      maxNumber: config.maxNumber,
      description: config.description
    }));
  });

  const [gameState, setGameState] = useState<GameState>('levelselect');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [answer, setAnswer] = useState('');
  const [ropePosition, setRopePosition] = useState(50);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [problemStartTime, setProblemStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isStruggling, setIsStruggling] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFrenzy, setIsFrenzy] = useState(false);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);

  const startLevel = (level: number) => {
    setSelectedLevel(level);
    setGameState('playing');
    setShowMenu(false);
    setScore(0);
    setRopePosition(50);
    setCombo(0);
    setMaxCombo(0);
    setStreak(0);
    setIsFrenzy(false);
    setProblemsSolved(0);
    setTotalAttempts(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setIsTimerRunning(true);
    if (gameMode === 'timed') setTimeLeft(timeLimit || 120);
    else if (gameMode === 'endless') setTimeLeft(999);
    else setTimeLeft(120);
    loadProblem();
  };

  const loadProblem = useCallback(() => {
    const newProblem = generateProblem(selectedLevel);
    setProblem(newProblem);
    setAnswer('');
    setProblemStartTime(Date.now());
  }, [selectedLevel]);

  const handleRestart = () => {
    setShowMenu(false);
    startLevel(selectedLevel);
  };

  const finishGame = () => {
    const victory = ropePosition < 50;
    setIsVictory(victory);
    
    if (victory) {
      const accuracy = correctAnswers / QUESTIONS_PER_LEVEL;
      let earnedStars = 0;
      if (accuracy >= 1) earnedStars = 3;
      else if (accuracy >= 0.9) earnedStars = 2;
      else if (accuracy >= 0.8) earnedStars = 1;
      
      const requiredCorrect = Math.ceil(QUESTIONS_PER_LEVEL * 0.7);
      const passed = correctAnswers >= requiredCorrect;
      
      const final = Math.floor(score * 1.5);
      const stars = passed ? earnedStars : Math.min(1, Math.floor(combo * 0.2));
      
      setFinalScore(final);
      setStarsEarned(Math.min(stars, 3));
      
      if (passed) {
        setGameState('levelcomplete');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'] });
        
        setLevels(prev => prev.map(l => {
          if (l.level === selectedLevel) {
            const newStars = Math.max(l.stars, earnedStars);
            const newBest = Math.max(l.bestScore, final);
            return { ...l, stars: newStars, bestScore: newBest };
          }
          if (l.level === selectedLevel + 1 && passed) {
            return { ...l, unlocked: true };
          }
          return l;
        }));
      } else {
        setGameState('gameover');
      }
    } else {
      const final = score;
      const stars = Math.min(1, Math.floor(combo * 0.2));
      setFinalScore(final);
      setStarsEarned(Math.min(stars, 3));
      setGameState('gameover');
    }
  };

  useEffect(() => {
    if (gameState !== 'playing' || !isTimerRunning) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        const isStruggleTime = prev <= 35 && prev >= 25;
        setIsStruggling(isStruggleTime);
        
        // Rope slowly moves to opponent side when time is running out
        if (prev <= 30) {
          setRopePosition(prev => Math.min(100, prev + 0.05));
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [gameState, isTimerRunning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() === '' || !problem) return;
    
    const userAnswer = parseInt(answer);
    const isCorrect = userAnswer === problem.answer;
    
    setTotalAttempts(prev => prev + 1);
    
    // Calculate pull strength based on speed and level
    const timeTaken = (Date.now() - problemStartTime) / 1000;
    const baseStrength = 15;
    const speedBonus = Math.max(0, 10 - timeTaken);
    const levelBonus = Math.floor(selectedLevel * 0.5);
    const comboMultiplier = Math.min(3, 1 + Math.floor(combo / 3));
    let pullStrength = (baseStrength + speedBonus + levelBonus) * comboMultiplier;
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectAnswers(prev => prev + 1);
      setCombo(prev => prev + 1);
      setMaxCombo(prev => Math.max(prev, combo + 1));
      setProblemsSolved(prev => prev + 1);
      
      // Add score
      const points = 50 + (selectedLevel * 10) + (combo * 10);
      setScore((prev) => prev + points);
      
      // Move rope towards victory
      const newPosition = ropePosition - pullStrength;
      setRopePosition(Math.max(0, newPosition));
      
      // Set feedback
      if (newStreak >= 5) {
        setFeedback(`🔥🔥 ${newStreak}x COMBO!`);
      } else if (newStreak >= 3) {
        setFeedback(`🔥 ${newStreak}x COMBO! +${points}`);
      } else {
        setFeedback(`+${points}`);
      }
      
      // Trigger frenzy at high combo
      if (newStreak >= 5 && !isFrenzy) {
        setIsFrenzy(true);
        setTimeout(() => setIsFrenzy(false), 5000);
      }
      
      // Confetti for streaks
      if (combo >= 3) {
        confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 }, colors: ['#fbbf24', '#10b981', '#3b82f6'] });
      }
    } else {
      setStreak(0);
      setCombo(0);
      setWrongAnswers(prev => prev + 1);
      
      // Move rope towards defeat
      const penaltyStrength = 12 + (selectedLevel * 0.5);
      const newPosition = ropePosition + penaltyStrength;
      setRopePosition(Math.min(100, newPosition));
      
      setFeedback('❌ WRONG!');
      confetti({ particleCount: 10, spread: 30, origin: { y: 0.6 }, colors: ['#ef4444'] });
    }
    
    setAnswer('');
    
    // Clear feedback
    setTimeout(() => setFeedback(null), 1500);
    
    // Check for victory/defeat
    if (ropePosition <= 0) {
      finishGame();
    } else if (ropePosition >= 100) {
      finishGame();
    } else if (problemsSolved + 1 >= QUESTIONS_PER_LEVEL) {
      finishGame();
    } else {
      loadProblem();
    }
  };

  const handleQuit = () => onComplete(0, 0);

  // Get difficulty color
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'from-green-400 to-emerald-500';
      case 'easy': return 'from-blue-400 to-cyan-500';
      case 'medium': return 'from-yellow-400 to-orange-500';
      case 'hard': return 'from-orange-500 to-red-500';
      case 'expert': return 'from-purple-500 to-pink-500';
      case 'master': return 'from-red-500 to-purple-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case 'beginner': return '🌱';
      case 'easy': return '⭐';
      case 'medium': return '🔥';
      case 'hard': return '⚡';
      case 'expert': return '👑';
      case 'master': return '💎';
      default: return '🎯';
    }
  };

  // Level Select Screen
  if (gameState === 'levelselect') {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-4 sm:p-6 overflow-y-auto">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.4), transparent),
                               radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.3), transparent),
                               radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.5), transparent)`,
              backgroundSize: '200px 200px'
            }}
            animate={{ backgroundPosition: ['0px 0px', '200px 200px'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-blue-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-600/15 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4 sm:mb-6"
          >
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onComplete(0, 0)} 
              className="px-4 py-2.5 sm:px-6 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold flex items-center gap-2 border border-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> 
              <span className="hidden sm:inline">BACK</span>
            </motion.button>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-2xl sm:text-4xl font-black tracking-tight"
            >
              TUG OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-400">WAR</span>
            </motion.h1>
            
            <div className="w-20 sm:w-32" />
          </motion.div>
          
          {/* Title Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4 sm:mb-6"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl border border-white/10">
              <Anchor className="w-5 h-5 text-cyan-400" />
              <p className="text-cyan-300 text-sm sm:text-lg font-semibold">Select Your Challenge</p>
              <Anchor className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Pull the rope to your side to win • {QUESTIONS_PER_LEVEL} questions to complete</p>
          </motion.div>
          
          {/* Level Grid */}
          <div className="flex-1 overflow-auto pb-4 px-1 sm:px-2">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-10 gap-2 sm:gap-3">
              {levels.map((level, index) => {
                const config = LEVEL_CONFIG[level.level - 1];
                const isLocked = !level.unlocked && level.level > 1;
                
                return (
                  <motion.div
                    key={level.level}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <motion.button
                      whileHover={!isLocked ? { scale: 1.05, y: -3 } : {}}
                      whileTap={!isLocked ? { scale: 0.95 } : {}}
                      onClick={() => !isLocked && startLevel(level.level)}
                      disabled={isLocked}
                      className={cn(
                        "w-full aspect-square rounded-xl flex flex-col items-center justify-center p-1 sm:p-2 transition-all relative overflow-hidden",
                        isLocked 
                          ? "bg-slate-800/50 border border-slate-700/50 cursor-not-allowed opacity-50" 
                          : "bg-slate-800/60 border border-white/10 hover:border-white/30 hover:bg-slate-700/60"
                      )}
                    >
                      {!isLocked && (
                        <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br", getDifficultyColor(config.difficulty))} />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center">
                        {isLocked ? (
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 mb-1" />
                        ) : (
                          <>
                            <span className="text-lg sm:text-2xl mb-0.5">{getDifficultyIcon(config.difficulty)}</span>
                            <span className="text-[10px] sm:text-xs font-bold text-white/90">Level {level.level}</span>
                            <span className="text-[8px] sm:text-[10px] text-gray-400 hidden sm:block">{config.description}</span>
                          </>
                        )}
                      </div>
                      
                      {!isLocked && level.stars > 0 && (
                        <div className="absolute top-1 right-1 flex gap-0.5">
                          {[1, 2, 3].map(s => (
                            <Star key={s} className={cn("w-2.5 h-2.5", s <= level.stars ? "fill-amber-400 text-amber-400" : "text-slate-600")} />
                          ))}
                        </div>
                      )}
                      
                      {level.bestScore > 0 && !isLocked && (
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                          <span className="text-[8px] sm:text-[9px] text-green-400 font-medium">{level.bestScore}</span>
                        </div>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs"
          >
            {[
              { emoji: '🌱', label: 'Beginner', color: 'text-green-400' },
              { emoji: '⭐', label: 'Easy', color: 'text-blue-400' },
              { emoji: '🔥', label: 'Medium', color: 'text-orange-400' },
              { emoji: '⚡', label: 'Hard', color: 'text-red-400' },
              { emoji: '👑', label: 'Expert', color: 'text-purple-400' },
              { emoji: '💎', label: 'Master', color: 'text-pink-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full">
                <span>{item.emoji}</span>
                <span className={cn(item.color, "font-medium")}>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing') {
    const config = LEVEL_CONFIG[selectedLevel - 1];
    const progress = (problemsSolved / QUESTIONS_PER_LEVEL) * 100;
    
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-y-scroll min-h-screen">
        {/* Game Header */}
        <div className="relative p-3 sm:p-4 border-b border-white/10">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg">
                {player?.avatar || '👤'}
              </div>
              <div>
                <p className="text-xs text-gray-400">YOU</p>
                <p className="font-bold text-lg">{score.toLocaleString()}</p>
              </div>
              {streak >= 3 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-orange-500/20 px-2 py-1 rounded-full">
                  <span className="text-orange-400 text-xs font-bold">🔥{streak}x</span>
                </motion.div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-400">PROGRESS</p>
              <p className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {problemsSolved}/{QUESTIONS_PER_LEVEL}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-lg",
                timeLeft <= 10 ? "bg-gradient-to-br from-red-500 to-orange-500 animate-pulse" : "bg-gradient-to-br from-slate-700 to-slate-600"
              )}>
                <Clock className={cn("w-5 h-5", timeLeft <= 10 ? "text-white" : "text-gray-400")} />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">TIME</p>
                <p className={cn("font-bold text-lg", timeLeft <= 10 ? "text-red-400" : "text-white")}>{timeLeft}s</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tug of War Visual */}
        <div className="relative py-6 px-4">
          {/* Rope */}
          <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
            {/* Position indicator */}
            <motion.div 
              className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-500"
              animate={{ left: `${ropePosition - 10}%`, width: '20%' }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
            {/* Center marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 -translate-x-1/2" />
          </div>
          
          {/* Rope handles and players */}
          <div className="flex justify-between items-center -mt-2">
            <motion.div 
              className="flex flex-col items-center"
              animate={{ x: ropePosition > 50 ? -20 : 20 }}
            >
              <div className="text-3xl sm:text-4xl">{player?.avatar || '👤'}</div>
              <div className="text-xs font-bold text-blue-400">YOU</div>
            </motion.div>
            
            <div className="text-center">
              <div className={cn(
                "text-2xl sm:text-3xl font-black",
                ropePosition < 30 ? "text-green-400" : ropePosition > 70 ? "text-red-400" : "text-yellow-400"
              )}>
                {ropePosition < 30 ? "WINNING!" : ropePosition > 70 ? "LOSING!" : "TUGGING!"}
              </div>
            </div>
            
            <motion.div 
              className="flex flex-col items-center"
              animate={{ x: ropePosition > 50 ? 20 : -20 }}
            >
              <div className="text-3xl sm:text-4xl">🤖</div>
              <div className="text-xs font-bold text-red-400">ENEMY</div>
            </motion.div>
          </div>
          
          {/* Frenzy indicator */}
          <AnimatePresence>
            {isFrenzy && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 right-4 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1 rounded-full text-sm font-bold animate-pulse"
              >
                ⚡ FRENZY MODE! ⚡
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Problem Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                className={cn(
                  "absolute top-1/4 z-20 px-6 py-3 rounded-2xl font-bold text-xl shadow-2xl",
                  feedback.includes('+') || feedback.includes('COMBO')
                    ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                    : "bg-gradient-to-r from-red-500 to-orange-500"
                )}
              >
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <p className="text-xs text-gray-400 mb-2">{config.challenge}</p>
                <motion.p 
                  key={problem?.question}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-wider"
                >
                  {problem?.question || '?'}
                </motion.p>
              </div>

              {/* Answer Input with On-Screen Keyboard */}
              <OnScreenKeyboard
                value={answer}
                onChange={setAnswer}
                onSubmit={handleSubmit}
                onSkip={() => {
                  setAnswer('');
                  loadProblem();
                }}
                placeholder="?"
                disabled={gameState !== 'playing'}
                inputClassName="bg-white/10 border-2 border-white/20 text-white placeholder-gray-500 focus:border-cyan-500/50"
              />
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="p-3 sm:p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Home Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onComplete(0, 0)}
                className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg font-medium flex items-center gap-1.5 text-sm"
              >
                <Home className="w-4 h-4" /> HOME
              </motion.button>
              
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGameState('levelselect')}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium flex items-center gap-1.5 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> BACK
              </motion.button>
              
              {/* Pause/Resume Button */}
              <button
                onClick={() => {
                  // Clear any existing timer immediately when pausing
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = undefined;
                  }
                  if (isTimerRunning) {
                    setIsTimerRunning(false);
                    setShowMenu(true);
                  } else {
                    setIsTimerRunning(true);
                    setShowMenu(false);
                  }
                }}
                className={cn(
                  "px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 text-sm cursor-pointer z-50",
                  isTimerRunning 
                    ? "bg-yellow-500/20 hover:bg-yellow-500/30" 
                    : "bg-green-500/20 hover:bg-green-500/30"
                )}
              >
                {isTimerRunning ? (
                  <><Pause className="w-4 h-4" /> PAUSE</>
                ) : (
                  <><Play className="w-4 h-4" /> RESUME</>
                )}
              </button>
              
              {/* Restart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestart}
                className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg font-medium flex items-center gap-1.5 text-sm"
              >
                <RotateCcw className="w-4 h-4" /> RESTART
              </motion.button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Correct: </span>
              <span className="text-green-400 font-bold">{correctAnswers}</span>
              <span className="text-gray-600 mx-1">|</span>
              <span className="text-xs text-gray-400">Wrong: </span>
              <span className="text-red-400 font-bold">{wrongAnswers}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Level Complete Screen
  if (gameState === 'levelcomplete') {
    const config = LEVEL_CONFIG[selectedLevel - 1];
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-8xl mb-4">
            🏆
          </motion.div>
          
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            VICTORY!
          </h2>
          
          <p className="text-xl text-gray-300 mb-6">Level {selectedLevel} Complete!</p>
          
          <div className="bg-white/10 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-black text-green-400">{finalScore.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Final Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-blue-400">{correctAnswers}/{QUESTIONS_PER_LEVEL}</p>
                <p className="text-xs text-gray-400">Correct</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((star, i) => (
                <motion.div
                  key={star}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + (i * 0.15), type: 'spring' }}
                >
                  <Star className={cn("w-10 h-10", star <= starsEarned ? "fill-amber-400 text-amber-400" : "text-slate-600")} />
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-center gap-6 text-xs">
              <div>
                <p className="font-bold text-purple-400">{maxCombo}x</p>
                <p className="text-gray-500">Max Combo</p>
              </div>
              <div>
                <p className="font-bold text-cyan-400">{Math.round((correctAnswers / QUESTIONS_PER_LEVEL) * 100)}%</p>
                <p className="text-gray-500">Accuracy</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameState('levelselect')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> LEVELS
            </motion.button>
            
            {selectedLevel < TOTAL_LEVELS && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startLevel(selectedLevel + 1)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold flex items-center gap-2"
              >
                <ChevronRight className="w-5 h-5" /> NEXT LEVEL
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Game Over Screen
  if (gameState === 'gameover') {
    const accuracy = Math.round((correctAnswers / QUESTIONS_PER_LEVEL) * 100);
    const passed = correctAnswers >= Math.ceil(QUESTIONS_PER_LEVEL * 0.7);
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }} className="text-8xl mb-4">
            {passed ? '🎯' : '💀'}
          </motion.div>
          
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            {passed ? 'ALMOST THERE!' : 'DEFEAT'}
          </h2>
          
          <p className="text-xl text-gray-300 mb-6">{passed ? 'Keep trying!' : 'Better luck next time!'}</p>
          
          <div className="bg-white/10 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-black text-green-400">{finalScore.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Final Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-blue-400">{correctAnswers}/{QUESTIONS_PER_LEVEL}</p>
                <p className="text-xs text-gray-400">Correct</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-6 text-xs">
              <div>
                <p className="font-bold text-purple-400">{maxCombo}x</p>
                <p className="text-gray-500">Max Combo</p>
              </div>
              <div>
                <p className="font-bold text-orange-400">{accuracy}%</p>
                <p className="text-gray-500">Accuracy</p>
              </div>
              <div>
                <p className="font-bold text-red-400">{wrongAnswers}</p>
                <p className="text-gray-500">Mistakes</p>
              </div>
            </div>
            
            {!passed && (
              <div className="mt-4 p-3 bg-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm font-medium">Need {Math.ceil(QUESTIONS_PER_LEVEL * 0.7)} correct to pass</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 flex-wrap justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameState('levelselect')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> LEVELS
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRestart}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-bold flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> RETRY
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Menu Overlay
  if (showMenu) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-2xl p-6 border border-white/10 shadow-2xl max-w-sm w-full mx-4"
        >
          <h3 className="text-2xl font-bold text-center mb-6">Game Menu</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => { setShowMenu(false); setGameState('playing'); }}
              className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> RESUME
            </button>
            
            <button
              onClick={() => { setShowMenu(false); handleRestart(); }}
              className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> RESTART
            </button>
            
            <button
              onClick={() => { setShowMenu(false); setGameState('levelselect'); }}
              className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> LEVEL SELECT
            </button>
            
            <button
              onClick={handleQuit}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" /> QUIT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
