/**
 * Professional Game Overlay System
 * Handles pause, settings, help, and other in-game overlays
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pause, Play, RotateCcw, Home, Settings, Volume2, VolumeX,
  ChevronLeft, ChevronRight, HelpCircle, X, Music, User
} from 'lucide-react';
import { Button } from './Button';
import { audioManager } from '../lib/audio';

export type OverlayType = 'pause' | 'settings' | 'help' | 'gameover' | 'victory' | 'levelcomplete';

interface GameOverlayProps {
  isOpen: boolean;
  type: OverlayType;
  onClose: () => void;
  onResume?: () => void;
  onRestart?: () => void;
  onQuit?: () => void;
  onNextLevel?: () => void;
  title?: string;
  score?: number;
  stars?: number;
  children?: React.ReactNode;
}

export default function GameOverlay({
  isOpen,
  type,
  onClose,
  onResume,
  onRestart,
  onQuit,
  onNextLevel,
  title,
  score,
  stars,
  children
}: GameOverlayProps) {
  const [musicEnabled, setMusicEnabled] = useState(audioManager.isEnabled());
  const [sfxVolume, setSfxVolume] = useState(audioManager.getSfxVolume());
  const [musicVolume, setMusicVolume] = useState(audioManager.getMusicVolume());

  const handleResume = () => {
    audioManager.playClick();
    onResume?.();
    onClose();
  };

  const handleRestart = () => {
    audioManager.playClick();
    onRestart?.();
    onClose();
  };

  const handleQuit = () => {
    audioManager.playClick();
    onQuit?.();
  };

  const handleNextLevel = () => {
    audioManager.playLevelup();
    onNextLevel?.();
    onClose();
  };

  const toggleMusic = () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    audioManager.setEnabled(newValue);
    if (newValue) audioManager.resume();
  };

  const handleSfxVolume = (value: number) => {
    setSfxVolume(value);
    audioManager.setSfxVolume(value);
  };

  const handleMusicVolume = (value: number) => {
    setMusicVolume(value);
    audioManager.setMusicVolume(value);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        if (type === 'settings') {
          onClose();
        } else {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, type, onClose, onResume]);

  const getTitle = () => {
    switch (type) {
      case 'pause': return 'Game Paused';
      case 'settings': return 'Settings';
      case 'help': return 'How to Play';
      case 'gameover': return 'Game Over';
      case 'victory': return 'Victory!';
      case 'levelcomplete': return 'Level Complete!';
      default: return title || 'Menu';
    }
  };

  const getOverlayContent = () => {
    switch (type) {
      case 'pause':
        return (
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleResume}
              className="w-full py-4 text-lg bg-green-500 hover:bg-green-600"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume Game
            </Button>
            <Button 
              onClick={handleRestart}
              className="w-full py-4 text-lg bg-blue-500 hover:bg-blue-600"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Restart
            </Button>
            <Button 
              onClick={() => onClose()}
              className="w-full py-4 text-lg bg-purple-500 hover:bg-purple-600"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Help
            </Button>
            <Button 
              onClick={handleQuit}
              className="w-full py-4 text-lg bg-red-500 hover:bg-red-600"
            >
              <Home className="w-5 h-5 mr-2" />
              Quit to Menu
            </Button>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Sound Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Sound</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Sound Effects</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleMusic}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                  >
                    {musicEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>SFX Volume</span>
                  <span>{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={sfxVolume}
                  onChange={(e) => handleSfxVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Music Volume</span>
                  <span>{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={musicVolume}
                  onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            {/* Game Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Game</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Show Tutorial</span>
                <button
                  onClick={() => {
                    localStorage.setItem('math_tutorial_seen', 'false');
                  }}
                  className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            <Button 
              onClick={onClose}
              className="w-full py-3 mt-4"
            >
              Back to Game
            </Button>
          </div>
        );

      case 'gameover':
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl"
            >
              😢
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
              {score !== undefined && (
                <p className="text-xl text-gray-300">Final Score: <span className="text-yellow-400 font-bold">{score}</span></p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleRestart}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={handleQuit}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700"
              >
                <Home className="w-5 h-5 mr-2" />
                Main Menu
              </Button>
            </div>
          </div>
        );

      case 'victory':
      case 'levelcomplete':
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="text-7xl"
            >
              {type === 'victory' ? '🏆' : '⭐'}
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{getTitle()}</h2>
              {score !== undefined && (
                <p className="text-xl text-gray-300">Score: <span className="text-yellow-400 font-bold">{score}</span></p>
              )}
              {stars !== undefined && (
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3].map((s) => (
                    <span key={s} className={`text-3xl ${s <= stars ? 'text-yellow-400' : 'text-gray-600'}`}>
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {onNextLevel && (
                <Button 
                  onClick={handleNextLevel}
                  className="w-full py-3 bg-green-500 hover:bg-green-600"
                >
                  <ChevronRight className="w-5 h-5 mr-2" />
                  Next Level
                </Button>
              )}
              <Button 
                onClick={handleRestart}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              <Button 
                onClick={handleQuit}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700"
              >
                <Home className="w-5 h-5 mr-2" />
                Main Menu
              </Button>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-4">
            {children || (
              <div className="text-gray-300 space-y-3">
                <p>🎮 <strong className="text-white">How to Play</strong></p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Solve math problems to progress</li>
                  <li>Answer quickly for bonus points</li>
                  <li>Build combos for multiplied scores</li>
                  <li>Complete levels to unlock new challenges</li>
                </ul>
                <p className="pt-2">⌨️ <strong className="text-white">Keyboard Shortcuts</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><kbd className="px-2 py-0.5 bg-gray-700 rounded">Enter</kbd> - Submit answer</li>
                  <li><kbd className="px-2 py-0.5 bg-gray-700 rounded">Escape</kbd> - Pause/Menu</li>
                  <li><kbd className="px-2 py-0.5 bg-gray-700 rounded">1-4</kbd> - Select answer</li>
                </ul>
              </div>
            )}
            <Button 
              onClick={onClose}
              className="w-full py-3 mt-4"
            >
              Got It!
            </Button>
          </div>
        );

      default:
        return children;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={type === 'pause' ? handleResume : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-md bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
              {type !== 'gameover' && type !== 'victory' && type !== 'levelcomplete' && (
                <button
                  onClick={type === 'pause' ? handleResume : onClose}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {getOverlayContent()}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Keyboard shortcut hints component
export function KeyboardHint({ keys }: { keys: string[] }) {
  return (
    <div className="flex gap-1">
      {keys.map((key, i) => (
        <kbd 
          key={i}
          className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 font-mono"
        >
          {key}
        </kbd>
      ))}
    </div>
  );
}
