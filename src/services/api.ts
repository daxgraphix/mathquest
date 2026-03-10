import { MathProblem, Difficulty, Player, LeaderboardEntry, Operation } from "../types";

// Helper function to safely get data from localStorage
function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// Helper function to safely set data in localStorage
function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
}

// Operation symbol mapping
function getOpSymbol(op: string): string {
  switch (op) {
    case "add": return "+";
    case "subtract": return "-";
    case "multiply": return "×";
    case "divide": return "÷";
    default: return "?";
  }
}

export async function fetchMathProblem(
  difficulty: Difficulty = 'easy', 
  operation?: string, 
  complexity: number = 1
): Promise<MathProblem> {
  const validOps = ["add", "subtract", "multiply", "divide"];
  const ops = operation && validOps.includes(operation) ? [operation] : validOps;

  const range = difficulty === "hard" ? 150 : difficulty === "medium" ? 60 : 12;
  
  const generateBasic = (targetOps: string[], customRange?: number) => {
    // Only use addition and multiplication for step calculations to avoid decimals
    const safeOps = targetOps.filter(op => op !== "divide");
    if (safeOps.length === 0) safeOps.push("add");
    
    const op = safeOps[Math.floor(Math.random() * safeOps.length)];
    const r = customRange || range;
    let n1 = 0, n2 = 0, ans = 0;
    
    switch (op) {
      case "add":
        n1 = Math.floor(Math.random() * r) + 1;
        n2 = Math.floor(Math.random() * r) + 1;
        ans = n1 + n2;
        break;
      case "subtract":
        n1 = Math.floor(Math.random() * r) + Math.max(5, r / 2);
        n2 = Math.floor(Math.random() * n1) + 1;
        ans = n1 - n2;
        break;
      case "multiply":
        const mRange = Math.min(r, 12);
        n1 = Math.floor(Math.random() * mRange) + 2;
        n2 = Math.floor(Math.random() * mRange) + 2;
        ans = n1 * n2;
        break;
      case "divide":
        const dRange = Math.min(r, 12);
        n2 = Math.floor(Math.random() * (dRange - 1)) + 2;
        ans = Math.floor(Math.random() * dRange) + 2;
        n1 = n2 * ans;
        break;
    }
    return { n1, n2, op, ans };
  };

  // For complexity 2 and 3, use only addition/subtraction for final step to avoid decimals
  if (complexity === 1) {
    const { n1, n2, op, ans } = generateBasic(ops);
    return {
      question: `${n1} ${getOpSymbol(op)} ${n2}`,
      answer: ans,
      num1: n1,
      num2: n2,
      operation: op as Operation,
      difficulty
    };
  } else if (complexity === 2) {
    // Use only + and - for the outer operation to ensure whole number answer
    const step1 = generateBasic(ops);
    const step2 = generateBasic(["add", "subtract"]); 
    const question = `(${step1.n1} ${getOpSymbol(step1.op)} ${step1.n2}) ${getOpSymbol(step2.op)} ${step2.n2}`;
    const answer = step2.op === "add" ? step1.ans + step2.n2 : Math.abs(step1.ans - step2.n2);
    return {
      question,
      answer,
      num1: step1.n1,
      num2: step1.n2,
      operation: step1.op
    };
  } else {
    // Use only + for the final operation to avoid decimals
    const part1 = generateBasic(ops, Math.floor(range / 2));
    const part2 = generateBasic(ops, Math.floor(range / 2));
    const finalOp = "add"; // Always use addition to avoid decimals
    const question = `(${part1.n1} ${getOpSymbol(part1.op)} ${part1.n2}) ${getOpSymbol(finalOp)} (${part2.n1} ${getOpSymbol(part2.op)} ${part2.n2})`;
    const answer = part1.ans + part2.ans;
    return {
      question,
      answer,
      num1: part1.n1,
      num2: part1.n2,
      operation: part1.op
    };
  }
}

// Local Storage Keys
const PLAYERS_KEY = 'math_arcade_players';
const LEADERBOARD_KEY = 'math_arcade_leaderboard';

// Internal player type for storage
interface StoredPlayer extends Player {
  id: number;
  username: string;
  total_score: number;
  stars: number;
}

export async function saveScore(
  playerId: number, 
  _gameName: string, 
  score: number, 
  stars: number = 0
): Promise<boolean> {
  const players = getLocalStorage<StoredPlayer[]>(PLAYERS_KEY, []);
  const playerIndex = players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    console.warn(`Player with ID ${playerId} not found`);
    return false;
  }
  
  players[playerIndex].total_score = (players[playerIndex].total_score || 0) + score;
  players[playerIndex].stars = (players[playerIndex].stars || 0) + stars;
  
  if (!setLocalStorage(PLAYERS_KEY, players)) {
    return false;
  }
  
  // Update Leaderboard
  const leaderboard = getLocalStorage<LeaderboardEntry[]>(LEADERBOARD_KEY, []);
  const player = players[playerIndex];
  const lbIndex = leaderboard.findIndex(l => l.username === player.username);
  
  if (lbIndex !== -1) {
    leaderboard[lbIndex].total_score = player.total_score;
    leaderboard[lbIndex].stars = player.stars;
  } else {
    leaderboard.push({
      username: player.username,
      total_score: player.total_score,
      stars: player.stars
    });
  }
  
  leaderboard.sort((a, b) => b.total_score - a.total_score);
  return setLocalStorage(LEADERBOARD_KEY, leaderboard.slice(0, 10));
}

export async function loginPlayer(username: string): Promise<Player> {
  const players = getLocalStorage<StoredPlayer[]>(PLAYERS_KEY, []);
  let player = players.find(p => p.username === username);
  
  if (!player) {
    const newPlayer: StoredPlayer = {
      id: Date.now(),
      username,
      total_score: 0,
      stars: 0,
      avatar: '👦',
      car_color: '#10b981',
      space_color: '#22d3ee',
      level_progress: {
        'tug-of-war': 1,
        'racing': 1,
        'bridge': 1,
        'space': 1,
        'battle': 1
      }
    };
    players.push(newPlayer);
    setLocalStorage(PLAYERS_KEY, players);
    return newPlayer;
  }
  
  return player;
}

export async function updatePlayerProfile(
  id: number, 
  avatar: string, 
  space_color: string
): Promise<Player | null> {
  const players = getLocalStorage<StoredPlayer[]>(PLAYERS_KEY, []);
  const playerIndex = players.findIndex(p => p.id === id);
  
  if (playerIndex === -1) {
    return null;
  }
  
  players[playerIndex] = { 
    ...players[playerIndex], 
    avatar, 
    space_color 
  };
  
  if (!setLocalStorage(PLAYERS_KEY, players)) {
    return null;
  }
  
  return players[playerIndex];
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return getLocalStorage<LeaderboardEntry[]>(LEADERBOARD_KEY, []);
}
