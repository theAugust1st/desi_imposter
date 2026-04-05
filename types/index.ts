import type { Region } from '../constants/regions';

export interface WordEntry {
  id: string;
  word: string;
  hints: {
    easy: string;
    medium: string;
    spicy: string;
  };
  category: 'food' | 'festival' | 'cricket' | 'culture' | 'place' | 'person';
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

  // Phase
  phase: GamePhase;

  // Actions
  setConfig: (config: Partial<GameConfig>) => void;
  setPlayers: (names: string[]) => void;
  clearPlayers: () => void;
  startGame: () => void;
  nextPlayer: () => void;
  goToDiscussion: () => void;
  goToReveal: () => void;
  playAgain: () => Promise<void>;
  resetGame: () => void;
}
