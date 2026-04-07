import type { Region } from '../constants/regions';

/**
 * Category type for words
 * These match the actual categories used in the data files
 */
export type Category =
  | 'food'
  | 'festival'
  | 'cricket'
  | 'culture'
  | 'places'
  | 'family'
  | 'bollywood'
  | 'music';

/**
 * All available categories as an array (useful for "All Categories" selection)
 */
export const ALL_CATEGORIES: Category[] = [
  'food',
  'festival',
  'cricket',
  'culture',
  'places',
  'family',
  'bollywood',
  'music',
];

export interface WordEntry {
  id: string;
  word: string;
  hints: {
    easy: string;
    medium: string;
    spicy: string;
  };
  category: Category;
  scope: 'shared' | 'local';
  regions: Region[];
  tags: string[];
}

export interface Player {
  id: string;
  name: string;
  isImposter: boolean;
}

export type HintDifficulty = 'easy' | 'medium' | 'spicy';

export interface GameConfig {
  selectedNationalities: Region[];
  selectedCategories: Category[];
  hintDifficulty: HintDifficulty;
  playerCount: number;
}

export type GamePhase = 'idle' | 'setup' | 'distributing' | 'discussion' | 'reveal';

export interface GameState {
  // Config
  config: GameConfig;
  players: Player[];

  // Active round
  currentWord: WordEntry | null;
  imposterIndex: number | null;
  currentDistributionIndex: number;
  firstPlayerIndex: number | null;

  // History (anti-repeat)
  usedWordIds: string[];

  // Content packs
  packWords: WordEntry[];
  packWordsLoaded: boolean;

  // Phase
  phase: GamePhase;

  // Actions
  setConfig: (config: Partial<GameConfig>) => void;
  setPlayers: (names: string[]) => void;
  clearPlayers: () => void;
  loadPackWords: () => Promise<void>;
  startGame: () => Promise<void>;
  nextPlayer: () => void;
  goToDiscussion: () => void;
  goToReveal: () => void;
  playAgain: () => Promise<void>;
  resetGame: () => void;
}
