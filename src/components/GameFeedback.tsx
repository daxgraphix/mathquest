/**
 * Enhanced Game Feedback System
 * Provides rich visual and audio feedback for game events
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { audioManager } from '../lib/audio';

export type FeedbackType = 'correct' | 'wrong' | 'combo' | 'powerup' | 'milestone' | 'info' | 'warning';

export interface FeedbackConfig {
  type: FeedbackType;
  message: string;
  points?: number;
  duration?: number;
  icon?: string;
}

interface FeedbackItem extends FeedbackConfig {
  id: number;
  timestamp: number;
}

interface GameFeedbackProps {
  feedback: FeedbackItem | null;
  onComplete?: (id: number) => void;
  position?: 'top' | 'center' | 'bottom';
}

const FEEDBACK_STYLES: Record<FeedbackType, {
  bg: string;
  border: string;
  text: string;
  icon: string;
  animation: 'pop' | 'shake' | 'slide' | 'bounce';
}> = {
  correct: {
    bg: 'bg-green-500/20',
    border: 'border-green-500',
    text: 'text-green-400',
    icon: '✓',
    animation: 'pop'
  },
  wrong: {
    bg: 'bg-red-500/20',
    border: 'border-red-500',
    text: 'text-red-400',
    icon: '✗',
    animation: 'shake'
  },
  combo: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500',
    text: 'text-cyan-400',
    icon: '⚡',
    animation: 'bounce'
  },
  powerup: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500',
    text: 'text-purple-400',
    icon: '⭐',
    animation: 'pop'
  },
  milestone: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500',
    text: 'text-yellow-400',
    icon: '🏆',
    animation: 'bounce'
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500',
    text: 'text-blue-400',
    icon: 'ℹ',
    animation: 'slide'
  },
  warning: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500',
    text: 'text-orange-400',
    icon: '⚠',
    animation: 'shake'
  }
};

const FEEDBACK_SOUNDS: Record<FeedbackType, () => void> = {
  correct: () => audioManager.playCorrect(),
  wrong: () => audioManager.playWrong(),
  combo: () => audioManager.playCombo(),
  powerup: () => audioManager.playPowerup(),
  milestone: () => audioManager.playVictory(),
  info: () => audioManager.playClick(),
  warning: () => audioManager.playWrong()
};

const ANIMATION_VARIANTS = {
  pop: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  },
  shake: {
    initial: { x: -20, opacity: 0 },
    animate: { x: [0, -10, 10, -10, 10, 0], opacity: 1 },
    exit: { x: 20, opacity: 0 }
  },
  slide: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 }
  },
  bounce: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: [1, 1.2, 1], opacity: 1 },
    exit: { scale: 1.1, opacity: 0 }
  }
};

let feedbackId = 0;

export function useGameFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const addFeedback = useCallback((config: FeedbackConfig) => {
    const id = ++feedbackId;
    const newFeedback: FeedbackItem = {
      ...config,
      id,
      timestamp: Date.now(),
      duration: config.duration || 1500
    };

    setFeedbacks(prev => [...prev, newFeedback]);

    // Play sound
    if (FEEDBACK_SOUNDS[config.type]) {
      FEEDBACK_SOUNDS[config.type]();
    }

    // Auto remove
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, newFeedback.duration);

    return id;
  }, []);

  const removeFeedback = useCallback((id: number) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  }, []);

  const showCorrect = useCallback((points?: number) => {
    return addFeedback({
      type: 'correct',
      message: 'Correct!',
      points
    });
  }, [addFeedback]);

  const showWrong = useCallback(() => {
    return addFeedback({
      type: 'wrong',
      message: 'Try Again!'
    });
  }, [addFeedback]);

  const showCombo = useCallback((count: number, points?: number) => {
    return addFeedback({
      type: 'combo',
      message: `${count}x Combo!`,
      points
    });
  }, [addFeedback]);

  const showPowerup = useCallback((name: string) => {
    return addFeedback({
      type: 'powerup',
      message: `${name} Activated!`
    });
  }, [addFeedback]);

  const showMilestone = useCallback((message: string, points?: number) => {
    return addFeedback({
      type: 'milestone',
      message,
      points
    });
  }, [addFeedback]);

  return {
    feedbacks,
    addFeedback,
    removeFeedback,
    showCorrect,
    showWrong,
    showCombo,
    showPowerup,
    showMilestone
  };
}

export function GameFeedback({ 
  feedback, 
  onComplete, 
  position = 'top' 
}: GameFeedbackProps) {
  if (!feedback) return null;

  const style = FEEDBACK_STYLES[feedback.type];
  const animation = ANIMATION_VARIANTS[style.animation];

  const positionClasses = {
    top: 'top-20',
    center: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-20'
  };

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-40',
        positionClasses[position]
      )}
      onAnimationComplete={() => onComplete?.(feedback.id)}
    >
      <div className={cn(
        'flex items-center gap-3 px-6 py-4 rounded-2xl border-2 backdrop-blur-sm',
        style.bg,
        style.border,
        style.text
      )}>
        <span className="text-2xl">{feedback.icon || style.icon}</span>
        <div>
          <p className="font-bold text-lg">{feedback.message}</p>
          {feedback.points !== undefined && (
            <p className={cn('text-sm font-semibold', style.text)}>
              +{feedback.points} points
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Feedback container for multiple feedbacks
export function FeedbackContainer({ 
  feedbacks,
  onComplete 
}: { 
  feedbacks: FeedbackItem[];
  onComplete?: (id: number) => void;
}) {
  if (feedbacks.length === 0) return null;
  
  // Only show the most recent feedback
  const feedback = feedbacks[feedbacks.length - 1];
  return (
    <GameFeedback 
      feedback={feedback} 
      onComplete={onComplete} 
      position="top" 
    />
  );
}

// Progress bar with animations
export function AnimatedProgressBar({
  value,
  max = 100,
  color = 'bg-cyan-500',
  showLabel = true,
  size = 'md',
  animated = true
}: {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-700 rounded-full overflow-hidden', heights[size])}>
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// Health/Energy bar with glow effect
export function GlowProgressBar({
  value,
  max = 100,
  type = 'health',
  showLabel = true
}: {
  value: number;
  max?: number;
  type?: 'health' | 'energy' | 'xp';
  showLabel?: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    health: {
      bg: 'bg-red-900/50',
      fill: 'bg-gradient-to-r from-red-600 to-red-400',
      glow: 'shadow-red-500/50'
    },
    energy: {
      bg: 'bg-blue-900/50',
      fill: 'bg-gradient-to-r from-blue-600 to-cyan-400',
      glow: 'shadow-cyan-500/50'
    },
    xp: {
      bg: 'bg-yellow-900/50',
      fill: 'bg-gradient-to-r from-yellow-600 to-amber-400',
      glow: 'shadow-yellow-500/50'
    }
  };

  const color = colors[type];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400 capitalize">{type}</span>
          <span className="text-white font-semibold">{value}/{max}</span>
        </div>
      )}
      <div className={cn('w-full h-4 rounded-full overflow-hidden', color.bg)}>
        <motion.div
          className={cn('h-full rounded-full', color.fill, 'shadow-lg', color.glow)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// Timer with warning state
export function GameTimer({
  value,
  max,
  warningThreshold = 10,
  criticalThreshold = 5,
  size = 'md'
}: {
  value: number;
  max: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const isWarning = value <= warningThreshold && value > criticalThreshold;
  const isCritical = value <= criticalThreshold;
  
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const colors = isCritical 
    ? 'text-red-500 animate-pulse' 
    : isWarning 
      ? 'text-yellow-400' 
      : 'text-white';

  return (
    <motion.div 
      key={value}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      className={cn('font-bold font-mono', sizes[size], colors)}
    >
      {Math.floor(value / 60)}:{(value % 60).toString().padStart(2, '0')}
    </motion.div>
  );
}

// Star rating display with animations
export function StarRating({
  stars,
  maxStars = 3,
  size = 'md',
  animated = true
}: {
  stars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxStars }).map((_, i) => (
        <motion.span
          key={i}
          initial={animated && i < stars ? { scale: 0, rotate: -180 } : false}
          animate={animated && i < stars ? { scale: 1, rotate: 0 } : false}
          transition={{ 
            delay: i * 0.15, 
            type: 'spring', 
            stiffness: 200 
          }}
          className={cn(
            sizes[size],
            i < stars ? 'text-yellow-400' : 'text-gray-600',
            'transition-colors'
          )}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
}

// Combo counter with scaling animation
export function ComboCounter({
  count,
  multiplier = 1
}: {
  count: number;
  multiplier?: number;
}) {
  if (count < 2) return null;

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      className="flex items-center gap-2"
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className="text-3xl"
      >
        🔥
      </motion.span>
      <div>
        <motion.span 
          className="text-2xl font-bold text-cyan-400"
          key={count}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
        >
          {count}x
        </motion.span>
        {multiplier > 1 && (
          <span className="text-sm text-yellow-400 ml-1">
            ×{multiplier}
          </span>
        )}
      </div>
    </motion.div>
  );
}
