import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, Zap, Trophy, Play } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../lib/utils';
import type { Difficulty } from '../types';

interface GameCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  onClick: () => void;
  level?: number;
  difficulty?: Difficulty;
  badge?: string;
}

export function GameCard({ title, icon, color, description, onClick, level = 1, difficulty, badge }: GameCardProps) {
  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-600',
    medium: 'bg-amber-100 text-amber-600',
    hard: 'bg-rose-100 text-rose-600'
  };

  return (
    <motion.div
      whileHover={{ y: -12 }}
      whileTap={{ scale: 0.98 }}
      className="card-arcade group cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      {/* Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.3), inset 0 0 40px rgba(99, 102, 241, 0.1)'
        }}
      />
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ x: '-100%' }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      </div>

      {badge && (
        <div className="absolute top-3 right-3 z-10 sm:top-4 sm:right-4">
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
            {badge}
          </span>
        </div>
      )}

      <div className="relative z-10">
        <div className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-6 shadow-lg transition-all group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl", 
          color
        )}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7 sm:w-8 sm:h-8' })}
          {/* Star decorations */}
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 text-xs"
          >
            ⭐
          </motion.span>
        </div>
        
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 sm:gap-2">
          <span className="label-caps text-xs sm:text-xs bg-slate-100 px-2 py-1 rounded-full">Level {level}</span>
        </div>

        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 mb-1 sm:mb-2 group-hover:text-indigo-600 transition-colors">{title}</h3>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mb-2 sm:mb-4 leading-relaxed line-clamp-2">{description}</p>
        
        {difficulty && (
          <div className="mb-2 sm:mb-4">
            <span className={cn("text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider", difficultyColors[difficulty])}>
              {difficulty}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100">
          <div className="hidden sm:flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.5 }}
                whileHover={{ scale: 1.1, opacity: 1 }}
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-[10px] font-black text-indigo-400 shadow-sm"
              >
                {['+','−','×'][i]}
              </motion.div>
            ))}
          </div>
          <Button 
            size="sm" 
            className="rounded-xl px-4 py-2.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm group-hover:bg-indigo-600 group-hover:shadow-lg transition-all"
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
            PLAY <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
