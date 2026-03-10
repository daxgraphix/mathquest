import { Mission, MissionCategory, GameType, Difficulty } from '../types';

// ==================== DAILY MISSIONS ====================

export const DAILY_MISSIONS: Omit<Mission, 'current' | 'completed'>[] = [
  {
    id: 'daily_solve',
    title: '🧮 Math Wizard',
    description: 'Solve 5 math problems correctly',
    target: 5,
    reward: 20,
    type: 'problems',
    category: 'daily'
  },
  {
    id: 'daily_combo',
    title: '⚡ Combo Lightning',
    description: 'Get a 3x combo in any game',
    target: 3,
    reward: 25,
    type: 'combo',
    category: 'daily'
  },
  {
    id: 'daily_star',
    title: '⭐ Star Collector',
    description: 'Earn 3 stars today',
    target: 3,
    reward: 15,
    type: 'stars',
    category: 'daily'
  },
  {
    id: 'daily_fun',
    title: '🎮 Game Champion',
    description: 'Play 2 different games today',
    target: 2,
    reward: 30,
    type: 'score',
    category: 'daily'
  },
  {
    id: 'daily_speed',
    title: '🚀 Speed Demon',
    description: 'Answer 3 problems in under 5 seconds each',
    target: 3,
    reward: 35,
    type: 'time',
    category: 'daily'
  },
  {
    id: 'daily_perfect',
    title: '💯 Perfect Score',
    description: 'Get 100% accuracy in one game',
    target: 1,
    reward: 50,
    type: 'accuracy',
    category: 'daily'
  }
];

// ==================== WEEKLY MISSIONS ====================

export const WEEKLY_MISSIONS: Omit<Mission, 'current' | 'completed'>[] = [
  {
    id: 'weekly_problems',
    title: '🧠 Math Champion',
    description: 'Solve 50 math problems this week',
    target: 50,
    reward: 100,
    type: 'problems',
    category: 'weekly'
  },
  {
    id: 'weekly_accuracy',
    title: '🎯 Sharp Shooter',
    description: 'Maintain 80% accuracy for 20 problems',
    target: 20,
    reward: 75,
    type: 'accuracy',
    category: 'weekly'
  },
  {
    id: 'weekly_explorer',
    title: '🌟 Super Explorer',
    description: 'Play all 6 game modes',
    target: 6,
    reward: 80,
    type: 'score',
    category: 'weekly'
  },
  {
    id: 'weekly_combo',
    title: '🔥 Combo Master',
    description: 'Get a 10x combo',
    target: 10,
    reward: 150,
    type: 'combo',
    category: 'weekly'
  },
  {
    id: 'weekly_time',
    title: '⏰ Time Traveler',
    description: 'Play for 30 minutes total',
    target: 30,
    reward: 60,
    type: 'time',
    category: 'weekly'
  },
  {
    id: 'weekly_star',
    title: '⭐ Star Collector',
    description: 'Earn 15 stars this week',
    target: 15,
    reward: 100,
    type: 'stars',
    category: 'weekly'
  }
];

// ==================== SPECIAL MISSIONS ====================

export const SPECIAL_MISSIONS: Omit<Mission, 'current' | 'completed'>[] = [
  {
    id: 'special_boss',
    title: '👾 Boss Hunter',
    description: 'Defeat 10 Space Bosses',
    target: 10,
    reward: 200,
    type: 'score',
    category: 'special',
    gameType: 'space'
  },
  {
    id: 'special_racer',
    title: '🏁 Racing Champion',
    description: 'Complete 10 races',
    target: 10,
    reward: 150,
    type: 'score',
    category: 'special',
    gameType: 'racing'
  },
  {
    id: 'special_bridge',
    title: '🌉 Master Builder',
    description: 'Build 50 bridge segments',
    target: 50,
    reward: 175,
    type: 'score',
    category: 'special',
    gameType: 'bridge'
  },
  {
    id: 'special_tug',
    title: '💪 Tug Master',
    description: 'Win 15 Tug of War matches',
    target: 15,
    reward: 125,
    type: 'score',
    category: 'special',
    gameType: 'tug-of-war'
  }
];

// ==================== CHALLENGE MISSIONS (Hard) ====================

export const CHALLENGE_MISSIONS: Omit<Mission, 'current' | 'completed'>[] = [
  {
    id: 'challenge_hard',
    title: '🔥 Hard Core',
    description: 'Complete a game on Hard difficulty',
    target: 1,
    reward: 100,
    type: 'score',
    category: 'challenge',
    difficulty: 'hard'
  },
  {
    id: 'challenge_perfect',
    title: '💎 Perfectionist',
    description: 'Get 100% accuracy (min 10 problems)',
    target: 10,
    reward: 250,
    type: 'accuracy',
    category: 'challenge'
  },
  {
    id: 'challenge_speed',
    title: '⚡ Speed Demon',
    description: 'Solve 10 problems in under 3 seconds each',
    target: 10,
    reward: 150,
    type: 'time',
    category: 'challenge'
  },
  {
    id: 'challenge_legend',
    title: '👑 Legend',
    description: 'Score over 5000 points in one game',
    target: 5000,
    reward: 300,
    type: 'score',
    category: 'challenge'
  },
  {
    id: 'challenge_unstoppable',
    title: '🌈 Unstoppable',
    description: 'Get a 20x combo',
    target: 20,
    reward: 400,
    type: 'combo',
    category: 'challenge'
  },
  {
    id: 'challenge_warrior',
    title: '⚔️ Battle Warrior',
    description: 'Win 5 battles without taking damage',
    target: 5,
    reward: 350,
    type: 'score',
    category: 'challenge',
    gameType: 'battle'
  }
];

// ==================== MISSION GENERATION ====================

function getMissionExpiration(category: MissionCategory): string {
  const now = new Date();
  
  switch (category) {
    case 'daily':
      // Expires at midnight
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.toISOString();
    
    case 'weekly':
      // Expires next Sunday
      const nextSunday = new Date(now);
      const dayOfWeek = nextSunday.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
      nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
      nextSunday.setHours(0, 0, 0, 0);
      return nextSunday.toISOString();
    
    case 'special':
    case 'challenge':
      // No expiration for special/challenge
      return '';
    
    default:
      return '';
  }
}

export function generateDailyMissions(): Mission[] {
  const shuffled = [...DAILY_MISSIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(m => ({
    ...m,
    current: 0,
    completed: false,
    expiresAt: getMissionExpiration('daily')
  }));
}

export function generateWeeklyMissions(): Mission[] {
  const shuffled = [...WEEKLY_MISSIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2).map(m => ({
    ...m,
    current: 0,
    completed: false,
    expiresAt: getMissionExpiration('weekly')
  }));
}

export function getSpecialMissions(): Mission[] {
  return SPECIAL_MISSIONS.map(m => ({
    ...m,
    current: 0,
    completed: false
  }));
}

export function getChallengeMissions(): Mission[] {
  return CHALLENGE_MISSIONS.map(m => ({
    ...m,
    current: 0,
    completed: false
  }));
}

// ==================== MISSION UTILITIES ====================

export function isMissionExpired(mission: Mission): boolean {
  if (!mission.expiresAt) return false;
  return new Date(mission.expiresAt) < new Date();
}

export function getMissionProgress(mission: Mission): number {
  return Math.min(100, Math.round((mission.current / mission.target) * 100));
}

export function getMissionTimeRemaining(mission: Mission): string {
  if (!mission.expiresAt) return '';
  
  const now = new Date();
  const expires = new Date(mission.expiresAt);
  const diff = expires.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
}
