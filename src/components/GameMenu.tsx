import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, RotateCcw, Play, X, Pause, ArrowLeft, Settings, Volume2, VolumeX, Music, Bell, BellOff, Moon, Sun, Trophy, User, Star, Target, Zap, Shield } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../lib/utils';

interface GameMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onQuit: () => void;
  title?: string;
}

export default function GameMenu({ isOpen, onClose, onRestart, onQuit, title = 'PAUSED' }: GameMenuProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop with blur */}
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
              animate={{ 
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '10%', left: '10%' }}
            />
            <motion.div 
              className="absolute w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
              animate={{ 
                x: [0, -80, 0],
                y: [0, 60, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ bottom: '20%', right: '15%' }}
            />
            <motion.div 
              className="absolute w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl"
              animate={{ 
                x: [0, 50, 0],
                y: [0, -30, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
          
          {/* Menu Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md"
          >
            {/* Main Menu Card */}
            <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl p-1 rounded-3xl">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-[22px] p-6 sm:p-8">
                {/* Header with Icon */}
                <div className="text-center mb-8">
                  <motion.div 
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/30"
                    animate={{ 
                      boxShadow: ['0 0 20px rgba(168, 85, 247, 0.4)', '0 0 40px rgba(168, 85, 247, 0.6)', '0 0 20px rgba(168, 85, 247, 0.4)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Pause className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                    {title}
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-purple-500" />
                    <span className="text-purple-400 text-sm font-medium">GAME PAUSED</span>
                    <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-purple-500" />
                  </div>
                </div>

                {/* Menu Options Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Resume Button - Primary */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="group relative overflow-hidden p-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:via-green-400 hover:to-teal-400 rounded-2xl font-bold text-lg text-white shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Play className="w-6 h-6 fill-white" />
                      </div>
                      <span className="tracking-wide">RESUME GAME</span>
                    </div>
                  </motion.button>

                  {/* Settings Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Sound Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={cn(
                        "p-4 rounded-2xl font-medium text-sm transition-all flex flex-col items-center gap-2",
                        soundEnabled 
                          ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400" 
                          : "bg-slate-700/50 border border-slate-600/50 text-slate-400"
                      )}
                    >
                      {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                      <span>SOUND</span>
                    </motion.button>

                    {/* Music Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMusicEnabled(!musicEnabled)}
                      className={cn(
                        "p-4 rounded-2xl font-medium text-sm transition-all flex flex-col items-center gap-2",
                        musicEnabled 
                          ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400" 
                          : "bg-slate-700/50 border border-slate-600/50 text-slate-400"
                      )}
                    >
                      {musicEnabled ? <Music className="w-6 h-6" /> : <Music className="w-6 h-6 opacity-50" />}
                      <span>MUSIC</span>
                    </motion.button>
                  </div>

                  {/* Restart Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRestart}
                    className="group relative overflow-hidden p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 rounded-2xl font-bold text-lg text-white shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <RotateCcw className="w-6 h-6" />
                      </div>
                      <span className="tracking-wide">RESTART LEVEL</span>
                    </div>
                  </motion.button>

                  {/* Back to Levels */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onQuit}
                    className="group relative overflow-hidden p-4 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 hover:from-slate-500 hover:via-slate-600 hover:to-slate-700 rounded-2xl font-bold text-lg text-white shadow-lg transition-all border border-slate-500/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <div className="p-2 bg-white/10 rounded-xl">
                        <ArrowLeft className="w-6 h-6" />
                      </div>
                      <span className="tracking-wide">BACK TO LEVELS</span>
                    </div>
                  </motion.button>

                  {/* Quit to Home */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onQuit}
                    className="group relative overflow-hidden p-4 bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 hover:from-rose-500 hover:via-red-500 hover:to-orange-500 rounded-2xl font-bold text-lg text-white shadow-lg shadow-red-500/25 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Home className="w-6 h-6" />
                      </div>
                      <span className="tracking-wide">QUIT TO HOME</span>
                    </div>
                  </motion.button>
                </div>

                {/* Stats Preview */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Score: 0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-400" />
                      <span>Stars: 0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <span>Level: 1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute -top-2 -right-2 sm:top-4 sm:right-4 z-20 p-3 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-full border-2 border-slate-600 text-slate-300 hover:text-white transition-all shadow-lg"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Compact menu button for in-game use
interface GameMenuButtonProps {
  onClick: () => void;
}

export function GameMenuButton({ onClick }: GameMenuButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="absolute top-4 right-4 z-50 p-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:from-slate-700/80 hover:to-slate-800/80 backdrop-blur-sm rounded-xl border border-white/20 text-white/80 hover:text-white transition-all shadow-lg"
      title="Menu"
    >
      <Pause className="w-5 h-5" />
    </motion.button>
  );
}
