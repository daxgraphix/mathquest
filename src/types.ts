// ==================== GAME TYPES ====================

export type GameType = 'tug-of-war' | 'racing' | 'bridge' | 'space' | 'battle';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 'campaign' | 'challenge' | 'practice' | 'normal' | 'timed' | 'endless' | 'battle';

export type ChallengeType = 'timed' | 'endless' | 'survival' | 'precision';

export type TanzanianTransport = 'bajaji' | 'bodaboda' | 'daladala' | 'matatu';

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export type PowerUpType = 'multiplier' | 'shield' | 'speed' | 'magnet' | 'time';

// ==================== PLAYER ====================

export interface Player {
  id: number;
  username: string;
  total_score: number;
  stars: number;
  avatar: string;
  car_color: string;
  space_color: string;
  level_progress: Record<GameType, number>;
  // Campaign mode progress - per game, per level
  campaign_progress?: Record<GameType, CampaignLevel[]>;
  // Challenge mode stats
  challenge_high_scores?: Record<GameType, number>;
  // Current vehicle theme
  current_vehicle?: TanzanianTransport;
  abilities?: string[];
  unlocked_themes?: string[];
  unlocked_accessories?: string[];
  active_accessory?: string | null;
  // Enhanced tracking
  games_played?: number;
  total_problems_solved?: number;
  highest_combo?: number;
  achievements_unlocked?: string[];
}

// Campaign Level Progress
export interface CampaignLevel {
  level: number;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0-9 stars
  highScore: number;
  bestTime?: number;
}

// Challenge Mode Settings
export interface ChallengeSettings {
  type: ChallengeType;
  timeLimit?: number; // for timed mode (seconds)
  difficulty: Difficulty;
}

// ==================== MATH ====================

export interface MathProblem {
  question: string;
  answer: number;
  num1: number;
  num2: number;
  operation: string;
  difficulty?: Difficulty;
}

export interface AnswerResult {
  correct: boolean;
  correctAnswer?: number;
  timeTaken?: number;
}

// ==================== GAME STATS ====================

export interface GameStats {
  bosses?: number;
  distance?: number;
  problems?: number;
  segments?: number;
  races?: number;
  timeElapsed?: number;
  accuracy?: number;
  maxCombo?: number;
}

// ==================== MISSIONS ====================

export type MissionCategory = 'daily' | 'weekly' | 'special' | 'challenge';
export type MissionType = 'score' | 'problems' | 'stars' | 'time' | 'accuracy' | 'combo';

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  type: MissionType;
  category: MissionCategory;
  completed: boolean;
  expiresAt?: string;
  gameType?: GameType;
  difficulty?: Difficulty;
}

export interface MissionProgress {
  missionId: string;
  increment: number;
  finalValue?: number;
}

// ==================== ACHIEVEMENTS ====================

export type AchievementCategory = 'mastery' | 'explorer' | 'challenge' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  secret?: boolean;
}

export interface AchievementRequirement {
  type: 'games_played' | 'problems_solved' | 'score_total' | 'stars_earned' | 
        'combo' | 'accuracy' | 'time_played' | 'level_reached' | 'win_streak';
  gameType?: GameType;
  difficulty?: Difficulty;
  target: number;
}

export interface PlayerAchievement extends Achievement {
  unlockedAt?: string;
  progress: number;
}

// ==================== LEADERBOARD ====================

export interface LeaderboardEntry {
  username: string;
  total_score: number;
  stars: number;
  avatar?: string;
  rank?: number;
}

// ==================== GAME EVENTS ====================

export interface GameEvent {
  type: 'correct_answer' | 'wrong_answer' | 'powerup_collected' | 
        'boss_defeated' | 'level_up' | 'achievement_unlocked' | 'milestone_reached';
  timestamp: string;
  data: Record<string, unknown>;
}

export interface FeedbackMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'combo' | 'milestone';
  points?: number;
  icon?: string;
  duration?: number;
}

// ==================== DAILY CHALLENGE ====================

export interface DailyChallenge {
  date: string;
  gameType: GameType;
  difficulty: Difficulty;
  targetScore: number;
  bonusMultiplier: number;
  completed: boolean;
  bestScore?: number;
}

// ==================== TUTORIAL ====================

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  highlight?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}
