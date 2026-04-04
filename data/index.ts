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
 * - India words are ALWAYS included (India is cultural common ground)
 * - Other country words (Nepal, Bangladesh, Pakistan) are ONLY included
 *   if someone from that country is present in the room
 * 
 * @param selectedNationalities - Array of region codes representing who's in the room
 * @returns Combined word pool filtered by selected nationalities
 */
export function buildWordPool(selectedNationalities: Region[]): WordEntry[] {
  // Always include shared and India words
  const alwaysIncluded: WordEntry[] = [...shared, ...india];

  // Conditionally include other country words
  const conditionalWords: WordEntry[] = [
    ...(selectedNationalities.includes('NP') ? nepal : []),
    ...(selectedNationalities.includes('BD') ? bangladesh : []),
    ...(selectedNationalities.includes('PK') ? pakistan : []),
  ];

  return [...alwaysIncluded, ...conditionalWords];
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
