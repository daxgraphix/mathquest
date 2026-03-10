import { Achievement } from '../types';

// ==================== ACHIEVEMENT DEFINITIONS ====================

export const ACHIEVEMENTS: Achievement[] = [
  // ==================== MASTERY (Game-specific) ====================
  {
    id: 'tug_champion',
    title: 'Tug Champion',
    description: 'Win 10 Tug of War matches',
    icon: '💪',
    reward: 100,
    category: 'mastery',
    requirement: { type: 'games_played', gameType: 'tug-of-war', target: 10 },
    rarity: 'common'
  },
  {
    id: 'racing_pro',
    title: 'Racing Pro',
    description: 'Complete 25 races in Math Racing',
    icon: '🏎️',
    reward: 150,
    category: 'mastery',
    requirement: { type: 'games_played', gameType: 'racing', target: 25 },
    rarity: 'rare'
  },
  {
    id: 'bridge_builder',
    title: 'Bridge Builder',
    description: 'Build 100 bridge segments',
    icon: '🌉',
    reward: 200,
    category: 'mastery',
    requirement: { type: 'score_total', gameType: 'bridge', target: 100 },
    rarity: 'rare'
  },
  {
    id: 'space_explorer',
    title: 'Space Explorer',
    description: 'Complete 50 Space Missions',
    icon: '🚀',
    reward: 250,
    category: 'mastery',
    requirement: { type: 'games_played', gameType: 'space', target: 50 },
    rarity: 'epic'
  },
  
  // ==================== PROBLEM SOLVER ====================
  {
    id: 'math_rookie',
    title: 'Math Rookie',
    description: 'Solve your first 10 problems',
    icon: '1️⃣',
    reward: 25,
    category: 'challenge',
    requirement: { type: 'problems_solved', target: 10 },
    rarity: 'common'
  },
  {
    id: 'math_apprentice',
    title: 'Math Apprentice',
    description: 'Solve 100 math problems',
    icon: '🔢',
    reward: 75,
    category: 'challenge',
    requirement: { type: 'problems_solved', target: 100 },
    rarity: 'common'
  },
  {
    id: 'math_expert',
    title: 'Math Expert',
    description: 'Solve 500 math problems',
    icon: '🧮',
    reward: 200,
    category: 'challenge',
    requirement: { type: 'problems_solved', target: 500 },
    rarity: 'rare'
  },
  {
    id: 'math_master',
    title: 'Math Master',
    description: 'Solve 1000 math problems',
    icon: '🧠',
    reward: 500,
    category: 'challenge',
    requirement: { type: 'problems_solved', target: 1000 },
    rarity: 'epic'
  },
  
  // ==================== COMBO ACHIEVEMENTS ====================
  {
    id: 'combo_starter',
    title: 'Combo Starter',
    description: 'Achieve a 5x combo',
    icon: '⚡',
    reward: 50,
    category: 'challenge',
    requirement: { type: 'combo', target: 5 },
    rarity: 'common'
  },
  {
    id: 'combo_master',
    title: 'Combo Master',
    description: 'Achieve a 10x combo',
    icon: '🔥',
    reward: 150,
    category: 'challenge',
    requirement: { type: 'combo', target: 10 },
    rarity: 'rare'
  },
  {
    id: 'combo_legend',
    title: 'Combo Legend',
    description: 'Achieve a 25x combo',
    icon: '💥',
    reward: 500,
    category: 'challenge',
    requirement: { type: 'combo', target: 25 },
    rarity: 'legendary'
  },
  
  // ==================== ACCURACY ACHIEVEMENTS ====================
  {
    id: 'sharp_shooter',
    title: 'Sharp Shooter',
    description: 'Achieve 90% accuracy in a game',
    icon: '🎯',
    reward: 100,
    category: 'challenge',
    requirement: { type: 'accuracy', target: 90 },
    rarity: 'rare'
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Achieve 100% accuracy (10+ problems)',
    icon: '💎',
    reward: 300,
    category: 'challenge',
    requirement: { type: 'accuracy', target: 100 },
    rarity: 'legendary'
  },
  
  // ==================== SCORE ACHIEVEMENTS ====================
  {
    id: 'score_100',
    title: 'Century',
    description: 'Earn 100 total points',
    icon: '💯',
    reward: 25,
    category: 'challenge',
    requirement: { type: 'score_total', target: 100 },
    rarity: 'common'
  },
  {
    id: 'score_1000',
    title: 'Thousandaire',
    description: 'Earn 1000 total points',
    icon: '🏅',
    reward: 100,
    category: 'challenge',
    requirement: { type: 'score_total', target: 1000 },
    rarity: 'common'
  },
  {
    id: 'score_10000',
    title: 'High Scorer',
    description: 'Earn 10000 total points',
    icon: '🏆',
    reward: 300,
    category: 'challenge',
    requirement: { type: 'score_total', target: 10000 },
    rarity: 'rare'
  },
  {
    id: 'score_100000',
    title: 'Legend',
    description: 'Earn 100000 total points',
    icon: '👑',
    reward: 1000,
    category: 'challenge',
    requirement: { type: 'score_total', target: 100000 },
    rarity: 'legendary'
  },
  
  // ==================== STARS ACHIEVEMENTS ====================
  {
    id: 'star_collector',
    title: 'Star Collector',
    description: 'Earn 10 stars',
    icon: '⭐',
    reward: 25,
    category: 'special',
    requirement: { type: 'stars_earned', target: 10 },
    rarity: 'common'
  },
  {
    id: 'star_hoarder',
    title: 'Star Hoarder',
    description: 'Earn 100 stars',
    icon: '🌟',
    reward: 150,
    category: 'special',
    requirement: { type: 'stars_earned', target: 100 },
    rarity: 'rare'
  },
  {
    id: 'star_tycoon',
    title: 'Star Tycoon',
    description: 'Earn 500 stars',
    icon: '✨',
    reward: 500,
    category: 'special',
    requirement: { type: 'stars_earned', target: 500 },
    rarity: 'epic'
  },
  
  // ==================== EXPLORER (Play all games) ====================
  {
    id: 'adventurer',
    title: 'Adventurer',
    description: 'Play each game mode once',
    icon: '🗺️',
    reward: 50,
    category: 'explorer',
    requirement: { type: 'games_played', target: 5 },
    rarity: 'common'
  },
  {
    id: 'world_traveler',
    title: 'World Traveler',
    description: 'Play 10 games in each mode',
    icon: '🌍',
    reward: 200,
    category: 'explorer',
    requirement: { type: 'games_played', target: 50 },
    rarity: 'rare'
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Reach level 5 in all games',
    icon: '🎖️',
    reward: 1000,
    category: 'explorer',
    requirement: { type: 'level_reached', target: 5 },
    rarity: 'legendary',
    secret: true
  },
  
  // ==================== WIN STREAK ====================
  {
    id: 'winning_streak',
    title: 'On Fire',
    description: 'Win 5 games in a row',
    icon: '🔥',
    reward: 100,
    category: 'challenge',
    requirement: { type: 'win_streak', target: 5 },
    rarity: 'rare'
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Win 25 games in a row',
    icon: '⚔️',
    reward: 500,
    category: 'challenge',
    requirement: { type: 'win_streak', target: 25 },
    rarity: 'legendary'
  }
];

// ==================== ACHIEVEMENT UTILITIES ====================

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByRarity(rarity: string): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity);
}

export function getAchievementsByCategory(category: string): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'text-slate-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-yellow-400';
    default: return 'text-slate-400';
  }
}

export function getRarityBgColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'bg-slate-100';
    case 'rare': return 'bg-blue-100';
    case 'epic': return 'bg-purple-100';
    case 'legendary': return 'bg-yellow-100';
    default: return 'bg-slate-100';
  }
}
