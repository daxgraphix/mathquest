// ==================== SECURITY UTILITIES ====================

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/\"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate username format
 * - 2-20 characters
 * - Alphanumeric and underscores only
 * - No special characters
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }
  
  const sanitized = username.trim();
  
  if (sanitized.length < 2) {
    return { valid: false, error: 'Username must be at least 2 characters' };
  }
  
  if (sanitized.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(sanitized)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { valid: true };
}

/**
 * Validate numeric input
 */
export function validateNumber(value: unknown, min?: number, max?: number): { valid: boolean; value?: number; error?: string } {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid number' };
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, error: `Value must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, error: `Value must be at most ${max}` };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate color hex code
 */
export function validateColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validate avatar emoji
 */
export function validateAvatar(avatar: string): boolean {
  if (!avatar || typeof avatar !== 'string') return false;
  // Only allow single emoji characters
  const emojiRegex = /^\p{Emoji}$/u;
  return emojiRegex.test(avatar);
}

/**
 * Validate game score - prevent cheating
 * - Reasonable maximum based on game mode
 * - No negative scores
 */
export function validateScore(score: unknown, gameMode: string = 'normal'): { valid: boolean; value?: number; error?: string } {
  const result = validateNumber(score, 0, 1000000);
  
  if (!result.valid) {
    return result;
  }
  
  // Mode-based score limits
  const maxScores: Record<string, number> = {
    normal: 100000,
    timed: 150000,
    endless: 500000,
    battle: 200000
  };
  
  const maxScore = maxScores[gameMode] || 100000;
  
  if (result.value! > maxScore) {
    return { valid: false, error: `Score exceeds maximum for ${gameMode} mode` };
  }
  
  return { valid: true, value: result.value };
}

/**
 * Validate difficulty level
 */
export function validateDifficulty(difficulty: unknown): { valid: boolean; value?: string; error?: string } {
  const validDifficulties = ['easy', 'medium', 'hard'];
  
  if (!difficulty || typeof difficulty !== 'string') {
    return { valid: false, error: 'Difficulty is required' };
  }
  
  const normalized = difficulty.toLowerCase();
  
  if (!validDifficulties.includes(normalized)) {
    return { valid: false, error: 'Invalid difficulty level' };
  }
  
  return { valid: true, value: normalized };
}

/**
 * Validate game type
 */
export function validateGameType(gameType: unknown): { valid: boolean; value?: string; error?: string } {
  const validTypes = ['tug-of-war', 'racing', 'bridge', 'space'];
  
  if (!gameType || typeof gameType !== 'string') {
    return { valid: false, error: 'Game type is required' };
  }
  
  const normalized = gameType.toLowerCase();
  
  if (!validTypes.includes(normalized)) {
    return { valid: false, error: 'Invalid game type' };
  }
  
  return { valid: true, value: normalized };
}

/**
 * Parse and validate JSON from localStorage
 */
export function safeJSONParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

/**
 * Escape regex special characters
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate safe ID
 */
export function generateSafeId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
