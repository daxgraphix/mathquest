import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameType, Difficulty, ChallengeType, TanzanianTransport } from '../types';
import { Trophy, Zap, BookOpen, ArrowLeft, Clock, Infinity, Target, Star, Lock, Unlock } from 'lucide-react';
import { Button } from './Button';

type GameMode = 'campaign' | 'challenge' | 'practice';

interface ModeSelectorProps {
  gameType: GameType;
  onSelectMode: (mode: GameMode, subOptions?: any) => void;
  onBack: () => void;
  playerProgress?: {
    currentLevel: number;
    unlockedLevels: number;
    stars: number[];
  };
}

const CHALLENGE_TYPES: { type: ChallengeType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'timed', label: '60 Seconds', icon: <Clock className="w-8 h-8" />, description: 'Score as high as possible in 60 seconds' },
  { type: 'timed', label: '90 Seconds', icon: <Clock className="w-8 h-8" />, description: 'Score as high as possible in 90 seconds' },
  { type: 'timed', label: '120 Seconds', icon: <Clock className="w-8 h-8" />, description: 'Score as high as possible in 120 seconds' },
  { type: 'endless', label: 'Endless Run', icon: <Infinity className="w-8 h-8" />, description: 'Keep playing until you fail' },
  { type: 'survival', label: 'Survival', icon: <Target className="w-8 h-8" />, description: 'One wrong answer = Game Over' },
];

const TANZANIAN_TRANSPORTS: { type: TanzanianTransport; label: string; emoji: string; unlocked: boolean }[] = [
  { type: 'bajaji', label: 'Bajaji', emoji: '🛺', unlocked: true },
  { type: 'bodaboda', label: 'Bodaboda', emoji: '🏍️', unlocked: true },
  { type: 'daladala', label: 'Daladala', emoji: '🚌', unlocked: true },
  { type: 'matatu', label: 'Matatu', emoji: '🚐', unlocked: true },
];

const GAME_TITLES: Record<GameType, string> = {
  racing: 'GRAND PRIX RACING',
  'tug-of-war': 'TUG OF WAR',
  bridge: 'BRIDGE BUILDER',
  space: 'SPACE ODYSSEY',
  battle: 'MATH BATTLE ARENA',
};

export default function ModeSelector({ gameType, onSelectMode, onBack, playerProgress }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType>('timed');
  const [selectedTime, setSelectedTime] = useState(60);
  const [selectedVehicle, setSelectedVehicle] = useState<TanzanianTransport>('bajaji');

  const gameTitle = GAME_TITLES[gameType];

  const renderCampaignMode = () => {
    const showVehicles = gameType === 'racing';
    
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur p-6 rounded-3xl">
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            CAMPAIGN - 10 LEVELS
          </h3>
          <p className="text-slate-300 mb-6">
            {showVehicles 
              ? 'Progress through 10 challenging levels. Unlock new vehicles as you advance!'
              : 'Progress through 10 challenging levels. Master your math skills as you advance!'
            }
          </p>
          
          {/* Tanzanian Transport Vehicles - Only for Driving and Racing games */}
          {showVehicles && (
            <div className="mb-6">
              <h4 className="text-lg font-bold text-white mb-3">Select Your Vehicle</h4>
              <div className="grid grid-cols-4 gap-3">
                {TANZANIAN_TRANSPORTS.map((transport) => (
                  <button
                    key={transport.type}
                    onClick={() => setSelectedVehicle(transport.type)}
                    disabled={!transport.unlocked}
                    className={`p-4 rounded-2xl border-4 transition-all ${
                      selectedVehicle === transport.type
                        ? 'border-yellow-400 bg-yellow-400/20'
                        : 'border-white/20 bg-white/5'
                    } ${!transport.unlocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/40'}`}
                  >
                    <span className="text-3xl block mb-1">{transport.emoji}</span>
                    <span className="text-xs font-bold text-white">{transport.label}</span>
                    {!transport.unlocked && <Lock className="w-4 h-4 text-slate-400 mx-auto mt-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Level Progress */}
          <div>
            <h4 className="text-lg font-bold text-white mb-3">Level Progress</h4>
            <div className="grid grid-cols-5 gap-2">
              {[...Array(20)].map((_, i) => {
                const levelNum = i + 1;
                const isUnlocked = levelNum <= (playerProgress?.unlockedLevels || 1);
                const isBoss = levelNum === 5 || levelNum === 10;
                const stars = playerProgress?.stars?.[i] || 0;
                
                return (
                  <button
                    key={levelNum}
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && onSelectMode('campaign', { level: levelNum, vehicle: showVehicles ? selectedVehicle : null })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isBoss
                        ? 'border-purple-400 bg-purple-400/20'
                        : 'border-emerald-400 bg-emerald-400/20'
                    } ${isUnlocked ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="text-lg font-black text-white block">{levelNum}</span>
                        <div className="flex justify-center gap-0.5 mt-1">
                          {[...Array(3)].map((_, s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`}
                            />
                          ))}
                        </div>
                        {isBoss && <span className="text-[10px] font-bold text-purple-300">BOSS</span>}
                      </>
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400 mx-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Button onClick={onBack} variant="secondary" className="w-full">
          <ArrowLeft className="w-5 h-5 mr-2" /> BACK TO GAMES
        </Button>
      </div>
    );
  };

  const renderChallengeMode = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur p-6 rounded-3xl">
        <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-400" />
          CHALLENGE MODE
        </h3>
        <p className="text-slate-300 mb-6">
          Test your skills against the clock! High score challenges.
        </p>

        {/* Challenge Type Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-white mb-3">Challenge Type</h4>
          <div className="grid grid-cols-2 gap-3">
            {CHALLENGE_TYPES.map((challenge) => (
              <button
                key={challenge.type + challenge.label}
                onClick={() => {
                  setSelectedChallenge(challenge.type);
                  if (challenge.type === 'timed') setSelectedTime(60);
                }}
                className={`p-4 rounded-2xl border-4 transition-all text-left ${
                  selectedChallenge === challenge.type
                    ? 'border-orange-400 bg-orange-400/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-orange-400">{challenge.icon}</span>
                  <span className="font-bold text-white">{challenge.label}</span>
                </div>
                <p className="text-xs text-slate-400">{challenge.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection for Timed Mode */}
        {selectedChallenge === 'timed' && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white mb-3">Time Limit</h4>
            <div className="flex gap-3">
              {[60, 90, 120].map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`flex-1 p-4 rounded-2xl border-4 transition-all ${
                    selectedTime === time
                      ? 'border-blue-400 bg-blue-400/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <span className="text-2xl font-black text-white">{time}s</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-white mb-3">Difficulty</h4>
          <div className="flex gap-3">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => onSelectMode('challenge', { type: selectedChallenge, timeLimit: selectedTime, difficulty: diff })}
                className="flex-1 p-4 rounded-2xl border-4 border-white/20 bg-white/5 hover:border-white/40 transition-all"
              >
                <span className="text-lg font-bold text-white capitalize">{diff}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={onBack} variant="secondary" className="w-full">
        <ArrowLeft className="w-5 h-5 mr-2" /> BACK TO GAMES
      </Button>
    </div>
  );

  const renderPracticeMode = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur p-6 rounded-3xl">
        <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          PRACTICE MODE
        </h3>
        <p className="text-slate-300 mb-6">
          Practice without pressure! All features unlocked, no penalties.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('practice', { difficulty: 'easy' })}
            className="w-full p-6 rounded-2xl border-4 border-green-400 bg-green-400/20 hover:border-green-300 transition-all text-left"
          >
            <span className="text-xl font-black text-green-300">EASY</span>
            <p className="text-sm text-slate-300 mt-1">Simple problems, unlimited time</p>
          </button>
          
          <button
            onClick={() => onSelectMode('practice', { difficulty: 'medium' })}
            className="w-full p-6 rounded-2xl border-4 border-yellow-400 bg-yellow-400/20 hover:border-yellow-300 transition-all text-left"
          >
            <span className="text-xl font-black text-yellow-300">MEDIUM</span>
            <p className="text-sm text-slate-300 mt-1">Balanced challenge</p>
          </button>
          
          <button
            onClick={() => onSelectMode('practice', { difficulty: 'hard' })}
            className="w-full p-6 rounded-2xl border-4 border-red-400 bg-red-400/20 hover:border-red-300 transition-all text-left"
          >
            <span className="text-xl font-black text-red-300">HARD</span>
            <p className="text-sm text-slate-300 mt-1">Tough problems for experts</p>
          </button>
        </div>
      </div>

      <Button onClick={onBack} variant="secondary" className="w-full">
        <ArrowLeft className="w-5 h-5 mr-2" /> BACK TO GAMES
      </Button>
    </div>
  );

  if (selectedMode === 'campaign') {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <button onClick={() => setSelectedMode(null)} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to modes
        </button>
        {renderCampaignMode()}
      </div>
    );
  }

  if (selectedMode === 'challenge') {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <button onClick={() => setSelectedMode(null)} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to modes
        </button>
        {renderChallengeMode()}
      </div>
    );
  }

  if (selectedMode === 'practice') {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <button onClick={() => setSelectedMode(null)} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to modes
        </button>
        {renderPracticeMode()}
      </div>
    );
  }

  // Main Mode Selection
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black italic tracking-tighter text-center">
            {gameTitle}
          </h1>
        </motion.div>

        <p className="text-slate-400 text-xl mb-12 text-center">Choose your game mode</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Campaign Mode */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setSelectedMode('campaign')}
            className="bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 border-4 border-yellow-500/50 rounded-3xl p-8 hover:border-yellow-400 transition-all hover:scale-105 active:scale-95"
          >
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">CAMPAIGN</h2>
            <p className="text-slate-300 text-sm">10 progressive levels with vehicles unlock</p>
            <div className="mt-4 flex flex-wrap gap-1 justify-center">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < (playerProgress?.unlockedLevels || 20) ? 'bg-yellow-400' : 'bg-slate-600'}`} />
              ))}
            </div>
          </motion.button>

          {/* Challenge Mode */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setSelectedMode('challenge')}
            className="bg-gradient-to-br from-orange-600/30 to-red-800/30 border-4 border-orange-500/50 rounded-3xl p-8 hover:border-orange-400 transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">CHALLENGE</h2>
            <p className="text-slate-300 text-sm">Timed & endless high-score modes</p>
            <div className="mt-4 flex gap-2 justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
              <Infinity className="w-5 h-5 text-orange-400" />
              <Target className="w-5 h-5 text-orange-400" />
            </div>
          </motion.button>

          {/* Practice Mode */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => setSelectedMode('practice')}
            className="bg-gradient-to-br from-blue-600/30 to-cyan-800/30 border-4 border-blue-500/50 rounded-3xl p-8 hover:border-blue-400 transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">PRACTICE</h2>
            <p className="text-slate-300 text-sm">Learn at your own pace</p>
            <div className="mt-4 flex gap-1 justify-center">
              <span className="text-green-400">●</span>
              <span className="text-yellow-400">●</span>
              <span className="text-red-400">●</span>
            </div>
          </motion.button>
        </div>

        <Button onClick={onBack} variant="secondary" className="mt-12">
          <ArrowLeft className="w-5 h-5 mr-2" /> BACK TO ARCADE
        </Button>
      </div>
    </div>
  );
}
