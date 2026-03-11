import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Swords, Heart, Flame, Timer, Star, ArrowLeft, Play, RotateCcw, Lock, Check, Skull, Circle, Sparkles, Activity, ArrowRight, Shield, Cpu, Target, Zap as Lightning, Award, Crown, Medal, Gem, Skull as SkullIcon, Shield as ShieldIcon, Sword, TrendingUp, X, ChevronRight, Sparkle, Flame as FlameIcon, Home, Pause, SkipForward } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Player, Difficulty, MathProblem } from '../../types';
import confetti from 'canvas-confetti';
import GameMenu, { GameMenuButton } from '../GameMenu';
import OnScreenKeyboard from '../OnScreenKeyboard';

type GameState = 'levelselect' | 'intro' | 'ready' | 'battling' | 'finished' | 'levelcomplete' | 'gameover';

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

const DIFFICULTY_CONFIG: Record<Difficulty, { timePerQuestion: number; hp: number; aiSpeed: number; pointsPerCorrect: number }> = {
  easy: { timePerQuestion: 120, hp: 999, aiSpeed: 0.5, pointsPerCorrect: 100 },
  medium: { timePerQuestion: 120, hp: 999, aiSpeed: 0.75, pointsPerCorrect: 150 },
  hard: { timePerQuestion: 120, hp: 999, aiSpeed: 1.0, pointsPerCorrect: 250 }
};

// Progressive difficulty - from simple to hardest as level increases
const LEVEL_CONFIG: Level[] = [
  { level: 1, unlocked: true, stars: 0, bestScore: 0, challenge: 'Basic Addition', difficulty: 'beginner', operations: ['+'], maxNumber: 10, description: 'Simple addition (1-10)' },
  { level: 2, unlocked: true, stars: 0, bestScore: 0, challenge: 'Addition Practice', difficulty: 'beginner', operations: ['+'], maxNumber: 15, description: 'Addition up to 15' },
  { level: 3, unlocked: true, stars: 0, bestScore: 0, challenge: 'Easy Subtraction', difficulty: 'beginner', operations: ['-'], maxNumber: 15, description: 'Subtraction up to 15' },
  { level: 4, unlocked: true, stars: 0, bestScore: 0, challenge: 'Mixed Basics', difficulty: 'easy', operations: ['+', '-'], maxNumber: 20, description: 'Addition & subtraction (1-20)' },
  { level: 5, unlocked: true, stars: 0, bestScore: 0, challenge: 'Double Digits', difficulty: 'easy', operations: ['+', '-'], maxNumber: 30, description: 'Numbers up to 30' },
  { level: 6, unlocked: true, stars: 0, bestScore: 0, challenge: 'Introduction to Multiplication', difficulty: 'easy', operations: ['*'], maxNumber: 10, description: 'Times tables (1-10)' },
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

// Generate problems based on level progression - challenging whole number questions
const generateProblem = (selectedLevel: number): MathProblem => {
  const levelConfig = LEVEL_CONFIG[selectedLevel - 1];
  const maxNum = levelConfig.maxNumber;
  
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
  
  // For higher levels (10-14), create more challenging multi-step problems
  if (selectedLevel >= 10) {
    // Multi-step challenge problems with parentheses
    const ops1 = ['+', '-', '*'];
    const ops2 = ['+', '-'];
    
    const op1 = ops1[Math.floor(Math.random() * ops1.length)];
    const op2 = ops2[Math.floor(Math.random() * ops2.length)];
    
    const a = Math.floor(Math.random() * Math.min(10, maxNum / 3)) + 1;
    const b = Math.floor(Math.random() * Math.min(10, maxNum / 3)) + 1;
    const c = Math.floor(Math.random() * Math.min(10, maxNum / 4)) + 1;
    
    if (op1 === '*') {
      // (a × b) + c or (a × b) - c
      const inner = a * b;
      answer = op2 === '+' ? inner + c : inner - c;
      question = `(${a} × ${b}) ${op2} ${c}`;
    } else {
      // (a + b) × c or (a - b) × c
      const inner = op1 === '+' ? a + b : Math.max(a, b) - Math.min(a, b);
      answer = inner * c;
      question = `(${a} ${op1} ${b}) × ${c}`;
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
  
  // For medium levels - harder single operations
  const ops = levelConfig.operations;
  const op = ops[Math.floor(Math.random() * ops.length)];
  
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
      // Division with whole number answers only
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

interface BattleAI {
  name: string;
  avatar: string;
  speed: number;
  accuracy: number;
  title: string;
}

const createAI = (selectedLevel: number): BattleAI => {
  const titles = ['Apprentice', 'Student', 'Scholar', 'Warrior', 'Knight', 'Champion', 'Hero', 'Legend', 'Grandmaster', 'Math Lord'];
  const avatars = ['🧙', '📚', '⚔️', '🛡️', '🏆', '⭐', '🔥', '💎', '👑', '🎯'];
  const names = ['MathMonster', 'BrainBot', 'NumberNinja', 'CalcKing', 'QuestLord', 'MathWizard', 'NumberCrusher', 'ArithmeticAce', 'ProblemSolver', 'EquationMaster'];
  
  const levelIndex = Math.min(Math.floor((selectedLevel - 1) / 2), 9);
  
  return {
    name: names[levelIndex % names.length],
    avatar: avatars[levelIndex % avatars.length],
    title: titles[levelIndex],
    speed: 0.4 + (selectedLevel * 0.03),
    accuracy: 0.5 + (selectedLevel * 0.02) + (Math.random() * 0.2)
  };
};

interface BattleGameProps {
  player: Player | null;
  onComplete: (score: number, stars: number) => void;
  difficulty?: Difficulty;
  gameMode?: 'normal' | 'timed' | 'endless' | 'battle';
  timeLimit?: number;
}

export default function BattleGame({ player, onComplete, difficulty = 'medium', gameMode, timeLimit }: BattleGameProps) {
  const currentLevel = player.level_progress?.['battle'] || 1;
  
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
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(QUESTIONS_PER_LEVEL);
  const [showMenu, setShowMenu] = useState(false);
  
  const [myHP, setMyHP] = useState(DIFFICULTY_CONFIG[difficulty].hp);
  const [myScore, setMyScore] = useState(0);
  const [myCombo, setMyCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [questionHistory, setQuestionHistory] = useState<{question: string, userAnswer: string, correctAnswer: number, isCorrect: boolean}[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const [ai, setAi] = useState<BattleAI | null>(null);
  const [aiHP, setAiHP] = useState(DIFFICULTY_CONFIG[difficulty].hp);
  const [aiScore, setAiScore] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit || DIFFICULTY_CONFIG[difficulty].timePerQuestion);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const [feedback, setFeedback] = useState<{ type: string; text: string; points?: number } | null>(null);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate time per question based on level
  useEffect(() => {
    const baseTime = Math.max(5, 25 - selectedLevel); // Level 1 = 24s, Level 20 = 5s
    setTimeLeft(baseTime);
  }, [selectedLevel]);

  const startLevel = (level: number) => {
    setSelectedLevel(level);
    setAi(createAI(level));
    setGameState('ready');
    setMyHP(DIFFICULTY_CONFIG[difficulty].hp);
    setAiHP(DIFFICULTY_CONFIG[difficulty].hp);
    setMyScore(0);
    setAiScore(0);
    setMyCombo(0);
    setMaxCombo(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setStreak(0);
    setRound(1);
    setShowMenu(false);
    setQuestionHistory([]);
    setShowReport(false);
    setAiThinking(false);
  };

  const handleRestart = useCallback(() => {
    startLevel(selectedLevel);
  }, [selectedLevel, difficulty]);

  const startRound = useCallback(() => {
    const problem = generateProblem(selectedLevel);
    setCurrentProblem(problem);
    setTimeLeft(60); // Default 60 seconds per question
    setAnswer('');
    setIsTimerRunning(true);
    setGameState('battling');
    setAiThinking(false);
    setTimeout(() => inputRef.current?.focus(), 100);
    
    // AI makes a guess after a delay
    if (ai && Math.random() < ai.accuracy) {
      const aiDelay = (1500 / ai.speed);
      aiTimerRef.current = setTimeout(() => {
        setAiThinking(true);
        setTimeout(() => {
          // AI "answers" correctly
          setAiHP(prev => Math.max(0, prev - 1));
          setAiScore(prev => prev + DIFFICULTY_CONFIG[difficulty].pointsPerCorrect);
          setAiThinking(false);
        }, 500);
      }, aiDelay);
    }
  }, [difficulty, selectedLevel, ai]);

  useEffect(() => {
    if (gameState === 'battling' && isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'battling') {
      handleTimeout();
    }
    return () => { 
      if (timerRef.current) clearTimeout(timerRef.current); 
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [timeLeft, gameState, isTimerRunning]);

  const handleTimeout = () => {
    setIsTimerRunning(false);
    setMyHP(prev => Math.max(0, prev - 1));
    setMyCombo(0);
    setWrongAnswers(prev => prev + 1);
    setFeedback({ type: 'miss', text: '⏰ TIME UP!' });
    
    // Track history
    if (currentProblem) {
      setQuestionHistory(prev => [...prev, {
        question: currentProblem.question,
        userAnswer: 'TIMEOUT',
        correctAnswer: currentProblem.answer,
        isCorrect: false
      }]);
    }
    
    if (myHP <= 1) { 
      setGameState('gameover');
    } else { 
      setTimeout(() => {
        setRound(prev => {
          const newRound = prev + 1;
          if (newRound >= QUESTIONS_PER_LEVEL) {
            finishGame();
          } else {
            setGameState('ready');
            setTimeout(startRound, 1500);
          }
          return newRound;
        });
      }, 1500); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState !== 'battling' || !currentProblem || answer.trim() === '') return;
    
    const userAnswer = parseInt(answer);
    const isCorrect = userAnswer === currentProblem.answer;
    
    // Stop AI timer
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    
    // Track question history
    setQuestionHistory(prev => [...prev, {
      question: currentProblem.question,
      userAnswer: answer || 'No answer',
      correctAnswer: currentProblem.answer,
      isCorrect
    }]);
    
    setIsTimerRunning(false);
    
    if (isCorrect) {
      const basePoints = DIFFICULTY_CONFIG[difficulty].pointsPerCorrect;
      // Level bonus - higher levels = more points
      const levelBonus = Math.floor(selectedLevel * 5);
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Combo multiplier
      let comboMultiplier = 1;
      if (newStreak >= 3) comboMultiplier = 1.5;
      if (newStreak >= 5) comboMultiplier = 2;
      if (newStreak >= 10) comboMultiplier = 3;
      
      const points = Math.floor((basePoints + levelBonus) * comboMultiplier);
      
      setCorrectAnswers(prev => prev + 1);
      setMyScore(prev => prev + points);
      setMyCombo(prev => prev + 1);
      setMaxCombo(prev => Math.max(prev, myCombo + 1));
      setAiHP(prev => Math.max(0, prev - 1));
      
      if (newStreak >= 5) {
        setFeedback({ type: 'correct', text: `🔥🔥 ${newStreak}x COMBO!`, points });
      } else if (newStreak >= 3) {
        setFeedback({ type: 'correct', text: `🔥 ${newStreak}x COMBO! +${points}`, points });
      } else {
        setFeedback({ type: 'correct', text: `+${points}`, points });
      }
      
      // Confetti for combos
      if (myCombo >= 3) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 }, colors: ['#fbbf24', '#10b981', '#3b82f6'] });
      }
    } else {
      setMyHP(prev => Math.max(0, prev - 1));
      setMyCombo(0);
      setStreak(0);
      setWrongAnswers(prev => prev + 1);
      setFeedback({ type: 'wrong', text: '❌ WRONG!' });
      
      confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 }, colors: ['#ef4444'] });
    }
    
    setAnswer('');
    
    // Continue to next round
    setTimeout(() => {
      const currentMyHP = myHP;
      const currentAiHP = aiHP;
      
      setRound(prev => {
        const newRound = prev + 1;
        if (newRound >= QUESTIONS_PER_LEVEL) {
          finishGame();
        } else if (currentAiHP <= 1) {
          setGameState('ready');
          setTimeout(startRound, 1500);
        } else if (currentMyHP <= 0) {
          setGameState('gameover');
        } else {
          setGameState('ready');
          setTimeout(startRound, 1500);
        }
        return newRound;
      });
    }, 1200);
  };

  const finishGame = () => {
    const playerWon = myScore > aiScore || (myHP > 0 && aiHP <= 0);
    const scoreMultiplier = playerWon ? 1.5 : 1;
    const final = Math.floor(myScore * scoreMultiplier);
    
    if (playerWon) {
      const accuracy = correctAnswers / QUESTIONS_PER_LEVEL;
      let earnedStars = 0;
      if (accuracy >= 1) earnedStars = 3;
      else if (accuracy >= 0.9) earnedStars = 2;
      else if (accuracy >= 0.8) earnedStars = 1;
      
      const requiredCorrect = Math.ceil(QUESTIONS_PER_LEVEL * 0.7); // 70% to pass
      const passed = correctAnswers >= requiredCorrect;
      
      const stars = passed ? earnedStars : Math.min(1, Math.floor(myCombo * 0.2));
      
      setWinner(playerWon ? 'player' : 'ai');
      setFinalScore(final);
      setStarsEarned(Math.min(stars, 3));
      
      if (passed) {
        setGameState('levelcomplete');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'] });
        
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
      const stars = Math.min(1, Math.floor(myCombo * 0.2));
      setWinner(playerWon ? 'player' : 'ai');
      setFinalScore(final);
      setStarsEarned(Math.min(stars, 3));
      setGameState('gameover');
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

  // Level Select Screen - Professional Design
  if (gameState === 'levelselect') {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-4 sm:p-6 overflow-y-auto">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.4), transparent),
                               radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.3), transparent),
                               radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.5), transparent),
                               radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.2), transparent),
                               radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.4), transparent)`,
              backgroundSize: '200px 200px'
            }}
            animate={{ backgroundPosition: ['0px 0px', '200px 200px'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          {/* Ambient glows */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-red-600/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl" />
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
              BATTLE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">ARENA</span>
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
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-red-500/20 backdrop-blur-md rounded-2xl border border-white/10">
              <Target className="w-5 h-5 text-orange-400" />
              <p className="text-orange-300 text-sm sm:text-lg font-semibold">Select Your Challenge</p>
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Complete levels to unlock harder challenges • {QUESTIONS_PER_LEVEL} questions per level</p>
          </motion.div>
          
          {/* Level Grid */}
          <div className="flex-1 overflow-auto pb-4 px-1 sm:px-2">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-10 gap-2 sm:gap-3">
              {levels.map((level, index) => {
                const config = LEVEL_CONFIG[level.level - 1];
                const isLocked = !level.unlocked && level.level > 1;
                const isCurrent = selectedLevel === level.level;
                
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
                          : isCurrent
                            ? "bg-gradient-to-br from-purple-500/30 to-red-500/30 border-2 border-orange-400/50 shadow-lg shadow-orange-500/20"
                            : "bg-slate-800/60 border border-white/10 hover:border-white/30 hover:bg-slate-700/60"
                      )}
                    >
                      {/* Difficulty gradient background */}
                      {!isLocked && (
                        <div className={cn(
                          "absolute inset-0 opacity-20 bg-gradient-to-br",
                          getDifficultyColor(config.difficulty)
                        )} />
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
                      
                      {/* Stars display */}
                      {!isLocked && level.stars > 0 && (
                        <div className="absolute top-1 right-1 flex gap-0.5">
                          {[1, 2, 3].map(s => (
                            <Star 
                              key={s}
                              className={cn(
                                "w-2.5 h-2.5",
                                s <= level.stars 
                                  ? "fill-amber-400 text-amber-400" 
                                  : "text-slate-600"
                              )} 
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Best score */}
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

  // Ready Screen
  if (gameState === 'ready') {
    const config = LEVEL_CONFIG[selectedLevel - 1];
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            {getDifficultyIcon(config.difficulty)}
          </motion.div>
          
          <h2 className="text-3xl font-black mb-2">
            Level {selectedLevel}
          </h2>
          
          <div className={cn(
            "inline-block px-6 py-2 rounded-full bg-gradient-to-r mb-4",
            getDifficultyColor(config.difficulty)
          )}>
            <span className="font-bold text-white">{config.challenge}</span>
          </div>
          
          <p className="text-gray-300 mb-6 max-w-md">{config.description}</p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-400">Questions</p>
              <p className="text-xl font-bold">{QUESTIONS_PER_LEVEL}</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-400">Operations</p>
              <p className="text-xl font-bold">{config.operations.join(', ')}</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-400">Max Number</p>
              <p className="text-xl font-bold">{config.maxNumber}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameState('levelselect')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2 border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" /> BACK
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRound}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30"
            >
              <Play className="w-5 h-5" /> START BATTLE
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Battle Screen - Professional Design
  if (gameState === 'battling' || gameState === 'finished') {
    const config = LEVEL_CONFIG[selectedLevel - 1];
    const progress = (round / QUESTIONS_PER_LEVEL) * 100;
    
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-y-scroll min-h-screen">
        {/* Battle Header */}
        <div className="relative p-3 sm:p-4 border-b border-white/10">
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            {/* Player Stats */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg">
                {player?.avatar || '👤'}
              </div>
              <div>
                <p className="text-xs text-gray-400">YOU</p>
                <p className="font-bold text-lg">{myScore.toLocaleString()}</p>
              </div>
              {/* Combo indicator */}
              {streak >= 3 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-orange-500/20 px-2 py-1 rounded-full"
                >
                  <span className="text-orange-400 text-xs font-bold">🔥{streak}x</span>
                </motion.div>
              )}
            </div>
            
            {/* Round indicator */}
            <div className="text-center">
              <p className="text-xs text-gray-400">ROUND</p>
              <p className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {round}/{QUESTIONS_PER_LEVEL}
              </p>
            </div>
            
            {/* AI Stats */}
            <div className="flex items-center gap-3">
              {ai && (
                <>
                  <div>
                    <p className="text-xs text-gray-400 text-right">{ai.title}</p>
                    <p className="font-bold text-lg text-right">{aiScore.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg">
                    {ai.avatar}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-y-auto">
          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                className={cn(
                  "absolute top-1/4 left-1/2 -translate-x-1/2 z-20 px-6 py-3 rounded-2xl font-bold text-xl shadow-2xl",
                  feedback.type === 'correct' 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                    : feedback.type === 'wrong'
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : "bg-gradient-to-r from-yellow-500 to-orange-500"
                )}
              >
                {feedback.text}
                {feedback.points && <span className="ml-2 text-2xl">+{feedback.points}</span>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* VS Badge */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              ⚔️ BATTLE ⚔️
            </div>
          </motion.div>

          {/* Question Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
              {/* Timer */}
              <div className="flex justify-center mb-6">
                <div className={cn(
                  "relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4",
                  timeLeft > 10 
                    ? "border-green-500 bg-green-500/10" 
                    : timeLeft > 5
                      ? "border-yellow-500 bg-yellow-500/10 animate-pulse"
                      : "border-red-500 bg-red-500/10 animate-pulse"
                )}>
                  <span className={cn(
                    "text-2xl sm:text-3xl font-black",
                    timeLeft > 10 ? "text-green-400" : timeLeft > 5 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {timeLeft}
                  </span>
                  {/* Timer glow */}
                  <div className={cn(
                    "absolute inset-0 rounded-full opacity-30 animate-ping",
                    timeLeft > 10 ? "bg-green-400" : timeLeft > 5 ? "bg-yellow-400" : "bg-red-400"
                  )} />
                </div>
              </div>

              {/* Problem */}
              <div className="text-center mb-8">
                <p className="text-xs text-gray-400 mb-2">{config.challenge}</p>
                <motion.p 
                  key={currentProblem?.question}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-wider"
                >
                  {currentProblem?.question || '?'}
                </motion.p>
              </div>

              {/* Answer Input with On-Screen Keyboard */}
              <OnScreenKeyboard
                value={answer}
                onChange={setAnswer}
                onSubmit={handleSubmit}
                onSkip={() => {
                  setAnswer('');
                  const problem = generateProblem(selectedLevel);
                  setCurrentProblem(problem);
                  setTimeLeft(60);
                }}
                placeholder="?"
                disabled={gameState !== 'battling'}
                inputClassName="bg-white/10 border-2 border-white/20 text-white placeholder-gray-500 focus:border-orange-500/50"
              />
            </div>
          </motion.div>

          {/* AI Thinking Indicator */}
          <AnimatePresence>
            {aiThinking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 text-orange-400"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Cpu className="w-5 h-5" />
                </motion.span>
                <span className="text-sm font-medium">{ai?.name} is thinking...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="p-4 sm:p-5 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Home Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onComplete(0, 0)}
                className="px-5 py-3 bg-blue-500/30 hover:bg-blue-500/50 border-2 border-blue-500/50 rounded-xl font-bold flex items-center gap-2 text-base shadow-lg shadow-blue-500/20"
              >
                <Home className="w-5 h-5" /> HOME
              </motion.button>
              
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGameState('levelselect')}
                className="px-5 py-3 bg-white/20 hover:bg-white/30 border-2 border-white/30 rounded-xl font-bold flex items-center gap-2 text-base"
              >
                <ArrowLeft className="w-5 h-5" /> BACK
              </motion.button>
              
              {/* Pause/Resume Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Clear any existing timer immediately when pausing
                  if (timerRef.current) {
                    clearTimeout(timerRef.current);
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
                  "px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-base border-2 shadow-lg cursor-pointer z-50",
                  isTimerRunning 
                    ? "bg-yellow-500/30 hover:bg-yellow-500/50 border-yellow-500/50 text-yellow-300 shadow-yellow-500/20" 
                    : "bg-green-500/30 hover:bg-green-500/50 border-green-500/50 text-green-300 shadow-green-500/20"
                )}
              >
                {isTimerRunning ? (
                  <><Pause className="w-5 h-5" /> PAUSE</>
                ) : (
                  <><Play className="w-5 h-5" /> RESUME</>
                )}
              </motion.button>
              
              {/* Restart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestart}
                className="px-5 py-3 bg-purple-500/30 hover:bg-purple-500/50 border-2 border-purple-500/50 rounded-xl font-bold flex items-center gap-2 text-base shadow-lg shadow-purple-500/20"
              >
                <RotateCcw className="w-5 h-5" /> RESTART
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
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-8xl mb-4"
          >
            🏆
          </motion.div>
          
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            VICTORY!
          </h2>
          
          <p className="text-xl text-gray-300 mb-6">
            Level {selectedLevel} Complete!
          </p>
          
          {/* Stats */}
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
            
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((star, i) => (
                <motion.div
                  key={star}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + (i * 0.15), type: 'spring' }}
                >
                  <Star 
                    className={cn(
                      "w-10 h-10",
                      star <= starsEarned 
                        ? "fill-amber-400 text-amber-400" 
                        : "text-slate-600"
                    )} 
                  />
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-center gap-6 text-xs">
              <div>
                <p className="font-bold text-purple-400">{maxCombo}x</p>
                <p className="text-gray-500">Max Combo</p>
              </div>
              <div>
                <p className="font-bold text-orange-400">{Math.round((correctAnswers / QUESTIONS_PER_LEVEL) * 100)}%</p>
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
    const config = LEVEL_CONFIG[selectedLevel - 1];
    const accuracy = Math.round((correctAnswers / QUESTIONS_PER_LEVEL) * 100);
    const passed = correctAnswers >= Math.ceil(QUESTIONS_PER_LEVEL * 0.7);
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div 
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="text-8xl mb-4"
          >
            {passed ? '🎯' : '💀'}
          </motion.div>
          
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            {passed ? 'ALMOST THERE!' : 'DEFEAT'}
          </h2>
          
          <p className="text-xl text-gray-300 mb-6">
            {passed ? 'Keep trying!' : 'Better luck next time!'}
          </p>
          
          {/* Stats */}
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
                <p className="text-red-400 text-sm font-medium">
                  Need {Math.ceil(QUESTIONS_PER_LEVEL * 0.7)} correct to pass
                </p>
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
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold flex items-center gap-2"
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
              onClick={() => { setShowMenu(false); setGameState('battling'); setIsTimerRunning(true); }}
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
