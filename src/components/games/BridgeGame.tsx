import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Difficulty, MathProblem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, Hammer, Clock, Construction, ArrowRight, ArrowLeft, Lock, Check, Skull, Circle, Sparkles, Zap, Wind, RotateCcw, Flame, ChevronRight, Shield, X, Gem, Award, Medal, Crown, Activity, Hammer as HammerIcon, Target, Zap as Lightning, Home, Pause, Play } from 'lucide-react';
import { Button } from '../Button';
import GameMenu from '../GameMenu';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

type GameState = 'levelselect' | 'intro' | 'playing' | 'finished' | 'levelcomplete' | 'gameover';

const TOTAL_LEVELS = 20;
const QUESTIONS_PER_LEVEL = 15;

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
  { level: 1, unlocked: true, stars: 0, bestScore: 0, challenge: 'Basic Addition', difficulty: 'beginner', operations: ['+'], maxNumber: 10, description: 'Simple addition (1-10)' },
  { level: 2, unlocked: true, stars: 0, bestScore: 0, challenge: 'Addition Practice', difficulty: 'beginner', operations: ['+'], maxNumber: 15, description: 'Addition up to 15' },
  { level: 3, unlocked: true, stars: 0, bestScore: 0, challenge: 'Easy Subtraction', difficulty: 'beginner', operations: ['-'], maxNumber: 15, description: 'Subtraction up to 15' },
  { level: 4, unlocked: true, stars: 0, bestScore: 0, challenge: 'Mixed Basics', difficulty: 'easy', operations: ['+', '-'], maxNumber: 20, description: 'Add & subtract (1-20)' },
  { level: 5, unlocked: true, stars: 0, bestScore: 0, challenge: 'Double Digits', difficulty: 'easy', operations: ['+', '-'], maxNumber: 30, description: 'Numbers up to 30' },
  { level: 6, unlocked: true, stars: 0, bestScore: 0, challenge: 'Introduction to Times', difficulty: 'easy', operations: ['*'], maxNumber: 10, description: 'Times tables (1-10)' },
  { level: 7, unlocked: true, stars: 0, bestScore: 0, challenge: 'Multiplication Master', difficulty: 'medium', operations: ['*'], maxNumber: 12, description: 'Full times tables' },
  { level: 8, unlocked: true, stars: 0, bestScore: 0, challenge: 'Mixed Operations I', difficulty: 'medium', operations: ['+', '-', '*'], maxNumber: 15, description: 'Add, subtract, multiply' },
  { level: 9, unlocked: true, stars: 0, bestScore: 0, challenge: 'Division Basics', difficulty: 'medium', operations: ['/'], maxNumber: 10, description: 'Simple division' },
  { level: 10, unlocked: true, stars: 0, bestScore: 0, challenge: 'All Four Operations', difficulty: 'medium', operations: ['+', '-', '*', '/'], maxNumber: 12, description: '+, -, ×, ÷' },
  { level: 11, unlocked: true, stars: 0, bestScore: 0, challenge: 'Advanced Numbers', difficulty: 'hard', operations: ['+', '-', '*', '/'], maxNumber: 25, description: 'Larger numbers' },
  { level: 12, unlocked: true, stars: 0, bestScore: 0, challenge: 'Complex Multiplication', difficulty: 'hard', operations: ['*'], maxNumber: 15, description: 'Big multiplication' },
  { level: 13, unlocked: true, stars: 0, bestScore: 0, challenge: 'Two-Step Problems', difficulty: 'hard', operations: ['+', '-', '*', '/'], maxNumber: 20, description: 'Two operations' },
  { level: 14, unlocked: true, stars: 0, bestScore: 0, challenge: 'Expert Division', difficulty: 'hard', operations: ['/', '*'], maxNumber: 15, description: 'Complex division' },
  { level: 15, unlocked: true, stars: 0, bestScore: 0, challenge: 'Mental Math Pro', difficulty: 'expert', operations: ['+', '-', '*', '/'], maxNumber: 30, description: 'Fast calculations' },
  { level: 16, unlocked: true, stars: 0, bestScore: 0, challenge: 'Multi-Step Challenge', difficulty: 'expert', operations: ['+', '-', '*', '/'], maxNumber: 30, description: 'Multiple steps' },
  { level: 17, unlocked: true, stars: 0, bestScore: 0, challenge: 'Master Level', difficulty: 'expert', operations: ['+', '-', '*', '/'], maxNumber: 40, description: 'Large numbers' },
  { level: 18, unlocked: true, stars: 0, bestScore: 0, challenge: 'Ultimate Calculation', difficulty: 'master', operations: ['+', '-', '*', '/'], maxNumber: 50, description: 'Expert calculations' },
  { level: 19, unlocked: true, stars: 0, bestScore: 0, challenge: 'Legendary Math', difficulty: 'master', operations: ['+', '-', '*', '/'], maxNumber: 50, description: 'Legendary challenge' },
  { level: 20, unlocked: true, stars: 0, bestScore: 0, challenge: 'Math Champion', difficulty: 'master', operations: ['+', '-', '*', '/'], maxNumber: 100, description: 'Ultimate champion' }
];

const DIFFICULTY_CONFIG: Record<Difficulty, { timePerQuestion: number; hp: number; segments: number; pointsPerSegment: number }> = {
  easy: { timePerQuestion: 20, hp: 5, segments: 3, pointsPerSegment: 100 },
  medium: { timePerQuestion: 15, hp: 4, segments: 5, pointsPerSegment: 150 },
  hard: { timePerQuestion: 10, hp: 3, segments: 7, pointsPerSegment: 250 }
};

// Generate challenging problems with whole number answers
const generateProblem = (selectedLevel: number): MathProblem => {
  const levelConfig = LEVEL_CONFIG[selectedLevel - 1];
  const maxNum = levelConfig.maxNumber;
  
  const opMap: Record<string, string> = {
    '+': '+',
    '-': '-',
    '*': '×',
    '/': '÷'
  };
  
  let num1: number, num2: number, answer: number, question: string;
  
  // For higher levels, create multi-step challenge problems
  if (selectedLevel >= 10) {
    const ops1 = ['+', '-', '*'];
    const ops2 = ['+', '-'];
    
    const op1 = ops1[Math.floor(Math.random() * ops1.length)];
    const op2 = ops2[Math.floor(Math.random() * ops2.length)];
    
    const a = Math.floor(Math.random() * Math.min(10, maxNum / 3)) + 1;
    const b = Math.floor(Math.random() * Math.min(10, maxNum / 3)) + 1;
    const c = Math.floor(Math.random() * Math.min(10, maxNum / 4)) + 1;
    
    if (op1 === '*') {
      const inner = a * b;
      answer = op2 === '+' ? inner + c : inner - c;
      question = `(${a} × ${b}) ${opMap[op2]} ${c}`;
    } else {
      const inner = op1 === '+' ? a + b : Math.max(a, b) - Math.min(a, b);
      answer = inner * c;
      question = `(${a} ${opMap[op1]} ${b}) × ${c}`;
    }
    
    return {
      question,
      answer,
      num1: a,
      num2: b,
      operation: '*' as any,
      difficulty: levelConfig.difficulty as Difficulty
    };
  }
  
  const ops = levelConfig.operations;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const opSymbol = opMap[op];
  
  switch (op) {
    case '+':
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
    case '-':
      num1 = Math.floor(Math.random() * maxNum) + 5;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
      break;
    case '*':
      const multMax = Math.min(maxNum, 12);
      num1 = Math.floor(Math.random() * multMax) + 2;
      num2 = Math.floor(Math.random() * multMax) + 2;
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
      break;
    case '/':
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

interface BridgeGameProps {
  player: Player | null;
  onComplete: (score: number, stars: number, stats?: any) => void;
  difficulty?: Difficulty;
  gameMode?: 'normal' | 'timed' | 'endless' | 'battle';
  timeLimit?: number;
}

export default function BridgeGame({ player, onComplete, difficulty = 'medium', gameMode, timeLimit }: BridgeGameProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const currentLevel = player?.level_progress?.['bridge'] || 1;
  
  const [levels, setLevels] = useState<Level[]>(() => {
    return LEVEL_CONFIG.map((cfg, i) => ({
      level: cfg.level,
      unlocked: i === 0 || true,
      stars: 0,
      bestScore: 0,
      challenge: cfg.challenge,
      difficulty: cfg.difficulty,
      operations: cfg.operations,
      maxNumber: cfg.maxNumber,
      description: cfg.description
    }));
  });

  const [gameState, setGameState] = useState<GameState>('levelselect');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [answer, setAnswer] = useState('');
  const [bridgeSegments, setBridgeSegments] = useState(0);
  const [maxSegments] = useState(10);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 60);
  const [problemStartTime, setProblemStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [isBridgeComplete, setIsBridgeComplete] = useState(false);

  const startLevel = (level: number) => {
    setSelectedLevel(level);
    setGameState('playing');
    setShowMenu(false);
    setScore(0);
    setBridgeSegments(0);
    setCombo(0);
    setMaxCombo(0);
    setStreak(0);
    setProblemsSolved(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setIsBridgeComplete(false);
    if (gameMode === 'timed') setTimeLeft(timeLimit || 60);
    else setTimeLeft(60);
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
    const victory = bridgeSegments >= maxSegments;
    setIsVictory(victory);
    
    if (victory) {
      const accuracy = correctAnswers / Math.max(1, problemsSolved);
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
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#3b82f6'] });
        
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
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() === '' || !problem) return;
    
    const userAnswer = parseInt(answer);
    const isCorrect = userAnswer === problem.answer;
    
    const timeTaken = (Date.now() - problemStartTime) / 1000;
    const basePoints = 50 + (selectedLevel * 5);
    const speedBonus = Math.max(0, Math.floor((15 - timeTaken) * 5));
    const comboMultiplier = Math.min(3, 1 + Math.floor(combo / 3));
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectAnswers(prev => prev + 1);
      setCombo(prev => prev + 1);
      setMaxCombo(prev => Math.max(prev, combo + 1));
      setProblemsSolved(prev => prev + 1);
      
      const points = (basePoints + speedBonus) * comboMultiplier;
      setScore(prev => prev + points);
      
      // Add bridge segment
      const newSegments = bridgeSegments + 1;
      setBridgeSegments(newSegments);
      
      if (newSegments >= maxSegments) {
        setIsBridgeComplete(true);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 }, colors: ['#f59e0b', '#10b981'] });
      }
      
      if (newStreak >= 5) {
        setFeedback(`🔥🔥 ${newStreak}x COMBO! +${points}`);
      } else if (newStreak >= 3) {
        setFeedback(`🔥 ${newStreak}x COMBO! +${points}`);
      } else {
        setFeedback(`+${points}`);
      }
      
      if (combo >= 3) {
        confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 }, colors: ['#fbbf24', '#10b981', '#3b82f6'] });
      }
    } else {
      setStreak(0);
      setCombo(0);
      setWrongAnswers(prev => prev + 1);
      setProblemsSolved(prev => prev + 1);
      
      setFeedback('❌ WRONG!');
      confetti({ particleCount: 10, spread: 30, origin: { y: 0.6 }, colors: ['#ef4444'] });
    }
    
    setAnswer('');
    setTimeout(() => setFeedback(null), 1500);
    
    // Check victory
    if (bridgeSegments + (isCorrect ? 1 : 0) >= maxSegments) {
      finishGame();
    } else if (problemsSolved + 1 >= QUESTIONS_PER_LEVEL) {
      finishGame();
    } else if (!isCorrect && wrongAnswers + 1 >= 5) {
      // Too many mistakes
      finishGame();
    } else {
      loadProblem();
    }
  };

  const handleQuit = () => onComplete(0, 0);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'from-green-400 to-emerald-500';
      case 'easy': return 'from-blue-400 to-cyan-500';
      case 'medium': return 'from-yellow-400 to-orange-500';
      case 'hard': return 'from-orange-500 to-red-500';
      case 'expert': return 'from-purple-500 to-pink-500';
      case 'master': return 'from-amber-500 to-red-600';
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
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-amber-950 to-slate-950 text-white p-4 sm:p-6 overflow-hidden">
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
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-amber-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-orange-600/15 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
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
              BRIDGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-400">BUILDER</span>
            </motion.h1>
            
            <div className="w-20 sm:w-32" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4 sm:mb-6"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-white/10">
              <HammerIcon className="w-5 h-5 text-amber-400" />
              <p className="text-amber-300 text-sm sm:text-lg font-semibold">Select Your Challenge</p>
              <HammerIcon className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Build the bridge by solving problems • {maxSegments} segments to complete</p>
          </motion.div>
          
          <div className="flex-1 overflow-auto pb-4 px-1 sm:px-2">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-10 gap-2 sm:gap-3">
              {levels.map((level, index) => {
                const cfg = LEVEL_CONFIG[level.level - 1];
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
                        <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br", getDifficultyColor(cfg.difficulty))} />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center">
                        {isLocked ? (
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 mb-1" />
                        ) : (
                          <>
                            <span className="text-lg sm:text-2xl mb-0.5">{getDifficultyIcon(cfg.difficulty)}</span>
                            <span className="text-[10px] sm:text-xs font-bold text-white/90">Level {level.level}</span>
                            <span className="text-[8px] sm:text-[10px] text-gray-400 hidden sm:block">{cfg.description}</span>
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
              { emoji: '💎', label: 'Master', color: 'text-amber-400' },
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
    const cfg = LEVEL_CONFIG[selectedLevel - 1];
    const progress = (bridgeSegments / maxSegments) * 100;
    
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-amber-950 to-slate-950 text-white overflow-hidden">
        <div className="relative p-3 sm:p-4 border-b border-white/10">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg">
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
              <p className="text-xs text-gray-400">SEGMENTS</p>
              <p className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {bridgeSegments}/{maxSegments}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-lg",
                timeLeft <= 10 ? "bg-gradient-to-br from-red-500 to-orange-500 animate-pulse" : "bg-gradient-to-br from-amber-500 to-orange-500"
              )}>
                <Clock className={cn("w-5 h-5", timeLeft <= 10 ? "text-white" : "text-white")} />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">TIME</p>
                <p className={cn("font-bold text-lg", timeLeft <= 10 ? "text-red-400" : "text-white")}>{timeLeft}s</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bridge Visual */}
        <div className="relative py-6 px-4">
          <div className="flex justify-center items-end gap-1">
            {/* Starting platform */}
            <div className="w-16 h-20 bg-gradient-to-t from-slate-700 to-slate-600 rounded-t-lg flex items-center justify-center">
              <span className="text-2xl">{player?.avatar || '👤'}</span>
            </div>
            
            {/* Bridge segments */}
            {Array.from({ length: maxSegments }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: i < bridgeSegments ? 1 : 0.3 }}
                className={cn(
                  "w-8 h-20 rounded-t-md flex items-center justify-center",
                  i < bridgeSegments 
                    ? "bg-gradient-to-t from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/30" 
                    : "bg-slate-700"
                )}
              >
                {i < bridgeSegments && (
                  <HammerIcon className="w-4 h-4 text-amber-900" />
                )}
              </motion.div>
            ))}
            
            {/* Ending platform */}
            <div className="w-16 h-20 bg-gradient-to-t from-slate-700 to-slate-600 rounded-t-lg flex items-center justify-center">
              <span className="text-2xl">🏰</span>
            </div>
          </div>
          
          {/* Water/river */}
          <div className="mt-2 h-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-full opacity-50" />
        </div>

        {/* Problem Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
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
                <p className="text-xs text-gray-400 mb-2">{cfg.challenge}</p>
                <motion.p 
                  key={problem?.question}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-wider"
                >
                  {problem?.question || '?'}
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="?"
                  className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-6 py-4 text-2xl sm:text-3xl font-bold text-center text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!answer.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 disabled:shadow-none transition-all"
                >
                  BUILD!
                </motion.button>
              </form>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (gameState === 'playing') {
                    setShowMenu(true);
                  } else {
                    setShowMenu(false);
                    setGameState('playing');
                  }
                }}
                className={cn(
                  "px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 text-sm",
                  gameState === 'playing' 
                    ? "bg-yellow-500/20 hover:bg-yellow-500/30" 
                    : "bg-green-500/20 hover:bg-green-500/30"
                )}
              >
                {gameState === 'playing' ? (
                  <><Pause className="w-4 h-4" /> PAUSE</>
                ) : (
                  <><Play className="w-4 h-4" /> RESUME</>
                )}
              </motion.button>
              
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
    const cfg = LEVEL_CONFIG[selectedLevel - 1];
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950 to-slate-950 text-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-8xl mb-4">
            🏰
          </motion.div>
          
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            BRIDGE COMPLETE!
          </h2>
          
          <p className="text-xl text-gray-300 mb-6">Level {selectedLevel} Complete!</p>
          
          <div className="bg-white/10 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-black text-green-400">{finalScore.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Final Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-amber-400">{bridgeSegments}/{maxSegments}</p>
                <p className="text-xs text-gray-400">Segments</p>
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
                <p className="font-bold text-cyan-400">{Math.round((correctAnswers / Math.max(1, problemsSolved)) * 100)}%</p>
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
    const accuracy = Math.round((correctAnswers / Math.max(1, problemsSolved)) * 100);
    const passed = correctAnswers >= Math.ceil(QUESTIONS_PER_LEVEL * 0.7);
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }} className="text-8xl mb-4">
            {passed ? '🌉' : '💥'}
          </motion.div>
          
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            {passed ? 'ALMOST THERE!' : 'BRIDGE COLLAPSED!'}
          </h2>
          
          <p className="text-xl text-gray-300 mb-6">{passed ? 'Keep trying!' : 'Better luck next time!'}</p>
          
          <div className="bg-white/10 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-black text-green-400">{finalScore.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Final Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-amber-400">{bridgeSegments}/{maxSegments}</p>
                <p className="text-xs text-gray-400">Segments</p>
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
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl font-bold flex items-center gap-2"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
              <Activity className="w-5 h-5" /> RESUME
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
