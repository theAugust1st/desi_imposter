import type { Region } from '../constants/regions';
import type { WordEntry } from '../types';

// Import all word data
import sharedWords from './shared.json';
import indiaWords from './india.json';
import nepalWords from './nepal.json';
import bangladeshWords from './bangladesh.json';
import pakistanWords from './pakistan.json';

// Type the imported JSON
const shared = sharedWords as WordEntry[];
const india = indiaWords as WordEntry[];
const nepal = nepalWords as WordEntry[];
const bangladesh = bangladeshWords as WordEntry[];
const pakistan = pakistanWords as WordEntry[];

/**
 * Builds the word pool based on selected nationalities.
 * 
 * Rules:
 * - Shared words are ALWAYS included
 * - India words are ALWAYS included (cultural common ground, regardless of selection)
 * - Other country words (Nepal, Bangladesh, Pakistan) are ONLY included
 *   if selected by the user
 * 
 * Error Boundary:
 * - If the combined pool is empty (shouldn't happen), falls back to shared.json
 * - Logs a warning for debugging purposes
 * 
 * @param selectedNationalities - Array of region codes representing user selection
 * @returns Combined word pool with India always included
 */
export function buildWordPool(selectedNationalities: Region[]): WordEntry[] {
  // Always include shared and India words (India is always included silently)
  const alwaysIncluded: WordEntry[] = [...shared, ...india];

  // Conditionally include other country words based on user selection
  const conditionalWords: WordEntry[] = [
    ...(selectedNationalities.includes('NP') ? nepal : []),
    ...(selectedNationalities.includes('BD') ? bangladesh : []),
    ...(selectedNationalities.includes('PK') ? pakistan : []),
  ];

  const pool = [...alwaysIncluded, ...conditionalWords];

  // Error boundary: if pool is somehow empty, fallback to shared words
  if (pool.length === 0) {
    console.warn('[buildWordPool] Word pool is empty! Falling back to shared words.');
    return shared.length > 0 ? shared : getFallbackWord();
  }

  return pool;
}

/**
 * Emergency fallback word if all data files are empty
 * This should never happen in production, but provides safety
 */
function getFallbackWord(): WordEntry[] {
  console.error('[getFallbackWord] All word files are empty! Using emergency fallback.');
  return [
    {
      id: 'fallback_001',
      word: 'Chai',
      hints: {
        easy: 'A type of drink',
        medium: 'A hot spiced tea drunk across South Asia',
        spicy: 'Brewed with milk, cardamom, ginger and sugar',
      },
      category: 'food',
      scope: 'shared',
      regions: ['IN', 'NP', 'BD', 'PK'],
      tags: ['food', 'daily life'],
    },
  ];
}

/**
 * Get all words from a specific region
 */
export function getWordsByRegion(region: Region): WordEntry[] {
  switch (region) {
    case 'IN':
      return india;
    case 'NP':
      return nepal;
    case 'BD':
      return bangladesh;
    case 'PK':
      return pakistan;
    default:
      return [];
  }
}

/**
 * Get all shared words
 */
export function getSharedWords(): WordEntry[] {
  return shared;
}

/**
 * Get total word count for display
 */
export function getTotalWordCount(selectedNationalities: Region[]): number {
  return buildWordPool(selectedNationalities).length;
}

// Export individual collections for direct access if needed
export {
  shared as sharedWords,
  india as indiaWords,
  nepal as nepalWords,
  bangladesh as bangladeshWords,
  pakistan as pakistanWords,
};
