import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, Player, GameConfig, WordEntry } from '../types';
import { buildWordPool } from '../data';

const USED_WORDS_KEY = 'desi_imposter_used_words';
const MAX_HISTORY = 25;

const defaultConfig: GameConfig = {
  selectedNationalities: ['IN'], // India is always selected
  hintDifficulty: 'medium',
  playerCount: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  config: defaultConfig,
  players: [],
  currentWord: null,
  imposterIndex: null,
  currentDistributionIndex: 0,
  firstPlayerIndex: null,
  usedWordIds: [],
  phase: 'idle',

  // Actions
  setConfig: (newConfig: Partial<GameConfig>) => {
    set((state) => ({
      config: { ...state.config, ...newConfig },
    }));
  },

  setPlayers: (names: string[]) => {
    const players: Player[] = names.map((name, index) => ({
      id: `player_${index}`,
      name: name.trim(),
      isImposter: false,
    }));

    set({
      players,
      config: { ...get().config, playerCount: names.length },
    });
  },

  startGame: async () => {
    const state = get();
    const { config, players } = state;

    // Load used word IDs from storage
    let usedWordIds: string[] = [];
    try {
      const stored = await AsyncStorage.getItem(USED_WORDS_KEY);
      if (stored) {
        usedWordIds = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load used words from storage:', error);
    }

    // Build word pool based on selected nationalities
    const wordPool = buildWordPool(config.selectedNationalities);

    // Filter out recently used words
    const availableWords = wordPool.filter(
      (word: WordEntry) => !usedWordIds.includes(word.id)
    );

    // Fallback if all words used: reset history and use full pool
    const finalPool = availableWords.length > 0 ? availableWords : wordPool;

    // Select random word
    const randomIndex = Math.floor(Math.random() * finalPool.length);
    const selectedWord = finalPool[randomIndex];

    // Select random imposter
    const imposterIndex = Math.floor(Math.random() * players.length);

    // Update players with imposter role
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      isImposter: index === imposterIndex,
    }));

    // Select random first player
    const firstPlayerIndex = Math.floor(Math.random() * players.length);

    // Update used words history
    const newUsedWordIds = [...usedWordIds, selectedWord.id].slice(-MAX_HISTORY);

    // Save to storage
    try {
      await AsyncStorage.setItem(USED_WORDS_KEY, JSON.stringify(newUsedWordIds));
    } catch (error) {
      console.warn('Failed to save used words to storage:', error);
    }

    set({
      currentWord: selectedWord,
      imposterIndex,
      players: updatedPlayers,
      firstPlayerIndex,
      currentDistributionIndex: 0,
      usedWordIds: newUsedWordIds,
      phase: 'distributing',
    });
  },

  nextPlayer: () => {
    set((state) => ({
      currentDistributionIndex: state.currentDistributionIndex + 1,
    }));
  },

  goToDiscussion: () => {
    set({ phase: 'discussion' });
  },

  goToReveal: () => {
    set({ phase: 'reveal' });
  },

  resetGame: () => {
    set((state) => ({
      currentWord: null,
      imposterIndex: null,
      currentDistributionIndex: 0,
      firstPlayerIndex: null,
      phase: 'setup',
      players: state.players.map((p) => ({ ...p, isImposter: false })),
    }));
  },
}));

// Selector hooks for convenience
export const useConfig = () => useGameStore((state) => state.config);
export const usePlayers = () => useGameStore((state) => state.players);
export const useCurrentWord = () => useGameStore((state) => state.currentWord);
export const usePhase = () => useGameStore((state) => state.phase);
export const useImposterIndex = () => useGameStore((state) => state.imposterIndex);
export const useCurrentDistributionIndex = () =>
  useGameStore((state) => state.currentDistributionIndex);
export const useFirstPlayerIndex = () =>
  useGameStore((state) => state.firstPlayerIndex);
