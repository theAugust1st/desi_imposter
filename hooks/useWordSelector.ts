import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WordEntry } from '../types';
import type { Region } from '../constants/regions';
import { buildWordPool } from '../data';

const USED_WORDS_KEY = 'desi_imposter_used_words';
const MAX_HISTORY = 25;

interface UseWordSelectorResult {
  selectWord: (selectedNationalities: Region[]) => Promise<WordEntry>;
  getUsedWordIds: () => Promise<string[]>;
  clearHistory: () => Promise<void>;
}

/**
 * Hook for selecting words with anti-repeat logic
 * Tracks last 25 used word IDs in AsyncStorage
 * Falls back to shared words if selected pool is exhausted
 */
export function useWordSelector(): UseWordSelectorResult {
  /**
   * Get the list of recently used word IDs from storage
   */
  const getUsedWordIds = useCallback(async (): Promise<string[]> => {
    try {
      const stored = await AsyncStorage.getItem(USED_WORDS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load used words from storage:', error);
    }
    return [];
  }, []);

  /**
   * Save used word IDs to storage (rolling window of MAX_HISTORY)
   */
  const saveUsedWordIds = useCallback(async (wordIds: string[]): Promise<void> => {
    try {
      const trimmed = wordIds.slice(-MAX_HISTORY);
      await AsyncStorage.setItem(USED_WORDS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Failed to save used words to storage:', error);
    }
  }, []);

  /**
   * Select a random word from the pool, excluding recently used words
   * Falls back to shared words if the filtered pool is empty
   */
  const selectWord = useCallback(async (selectedNationalities: Region[]): Promise<WordEntry> => {
    // Get used word IDs
    const usedWordIds = await getUsedWordIds();

    // Build word pool based on selected nationalities
    const wordPool = buildWordPool(selectedNationalities);

    // Filter out recently used words
    let availableWords = wordPool.filter(
      (word: WordEntry) => !usedWordIds.includes(word.id)
    );

    // Fallback 1: If all words from selected pool are used, reset and use full pool
    if (availableWords.length === 0) {
      console.log('All words used, resetting to full pool');
      availableWords = wordPool;
      // Clear history since we're resetting
      await AsyncStorage.removeItem(USED_WORDS_KEY);
    }

    // Fallback 2: If pool is still empty (shouldn't happen), use shared words only
    if (availableWords.length === 0) {
      console.warn('Word pool empty, falling back to shared words');
      const sharedOnly = buildWordPool(['IN']); // India/shared is always included
      availableWords = sharedOnly;
    }

    // Select random word
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedWord = availableWords[randomIndex];

    // Update used words history
    const newUsedWordIds = [...usedWordIds, selectedWord.id];
    await saveUsedWordIds(newUsedWordIds);

    return selectedWord;
  }, [getUsedWordIds, saveUsedWordIds]);

  /**
   * Clear the used words history
   */
  const clearHistory = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USED_WORDS_KEY);
    } catch (error) {
      console.warn('Failed to clear used words history:', error);
    }
  }, []);

  return {
    selectWord,
    getUsedWordIds,
    clearHistory,
  };
}

// Standalone functions for use outside of React components
export async function selectWordFromPool(selectedNationalities: Region[]): Promise<WordEntry> {
  // Get used word IDs
  let usedWordIds: string[] = [];
  try {
    const stored = await AsyncStorage.getItem(USED_WORDS_KEY);
    if (stored) {
      usedWordIds = JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load used words from storage:', error);
  }

  // Build word pool
  const wordPool = buildWordPool(selectedNationalities);

  // Filter out recently used words
  let availableWords = wordPool.filter(
    (word: WordEntry) => !usedWordIds.includes(word.id)
  );

  // Fallback: reset if all used
  if (availableWords.length === 0) {
    availableWords = wordPool;
    await AsyncStorage.removeItem(USED_WORDS_KEY);
    usedWordIds = [];
  }

  // Fallback 2: shared words only
  if (availableWords.length === 0) {
    const sharedOnly = buildWordPool(['IN']);
    availableWords = sharedOnly;
  }

  // Select random word
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  const selectedWord = availableWords[randomIndex];

  // Save to history
  const newUsedWordIds = [...usedWordIds, selectedWord.id].slice(-MAX_HISTORY);
  try {
    await AsyncStorage.setItem(USED_WORDS_KEY, JSON.stringify(newUsedWordIds));
  } catch (error) {
    console.warn('Failed to save used words to storage:', error);
  }

  return selectedWord;
}

export default useWordSelector;
