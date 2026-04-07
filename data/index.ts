import type { Region } from '../constants/regions';
import type { WordEntry, Category } from '../types';

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
 * - Country-specific words are included ONLY if that country is selected
 * 
 * Error Boundary:
 * - If the combined pool is empty (shouldn't happen), falls back to shared.json
 * - Logs a warning for debugging purposes
 * 
 * @param selectedNationalities - Array of region codes representing user selection
 * @returns Combined word pool based on selection
 */
export function buildWordPool(selectedNationalities: Region[]): WordEntry[] {
  // Always include shared words
  const alwaysIncluded: WordEntry[] = [...shared];

  // Include country words based on user selection
  const conditionalWords: WordEntry[] = [
    ...(selectedNationalities.includes('IN') ? india : []),
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

/**
 * Builds the word pool based on selected nationalities AND categories.
 * 
 * Rules:
 * - First filters by region (shared words + selected country words)
 * - Then filters by selected categories
 * 
 * @param selectedNationalities - Array of region codes representing user selection
 * @param selectedCategories - Array of category strings to filter by
 * @returns Combined word pool filtered by both region and category
 */
export function buildWordPoolWithCategories(
  selectedNationalities: Region[],
  selectedCategories: Category[]
): WordEntry[] {
  // Step 1: Get region-filtered pool
  const regionPool = buildWordPool(selectedNationalities);

  // Step 2: If no categories selected, return region pool (shouldn't happen with validation)
  if (selectedCategories.length === 0) {
    console.warn('[buildWordPoolWithCategories] No categories selected, returning region pool');
    return regionPool;
  }

  // Step 3: Filter by category
  const filtered = regionPool.filter((word) =>
    selectedCategories.includes(word.category)
  );

  // Step 4: Log warning if empty (for debugging)
  if (filtered.length === 0) {
    console.warn(
      `[buildWordPoolWithCategories] Empty pool! Regions: ${selectedNationalities.join(', ')}, Categories: ${selectedCategories.join(', ')}`
    );
  }

  return filtered;
}

/**
 * Get all unique categories available in the current region-filtered word pool
 * Useful for displaying which categories have words based on region selection
 * 
 * @param selectedNationalities - Array of region codes
 * @returns Array of unique categories available in the word pool
 */
export function getAvailableCategories(selectedNationalities: Region[]): Category[] {
  const pool = buildWordPool(selectedNationalities);
  const categories = new Set<Category>();
  pool.forEach((word) => categories.add(word.category));
  return Array.from(categories).sort();
}

/**
 * Get word count with both region and category filtering
 * Used for real-time display in setup screen
 * 
 * @param selectedNationalities - Array of region codes
 * @param selectedCategories - Array of category strings
 * @returns Number of words matching both filters
 */
export function getWordCount(
  selectedNationalities: Region[],
  selectedCategories: Category[]
): number {
  return buildWordPoolWithCategories(selectedNationalities, selectedCategories).length;
}

/**
 * Check if word pool meets minimum requirement
 * Used for validation before starting the game
 * 
 * @param selectedNationalities - Array of region codes
 * @param selectedCategories - Array of category strings
 * @param minRequired - Minimum number of words required (default: 10)
 * @returns true if pool has enough words
 */
export function hasMinimumWords(
  selectedNationalities: Region[],
  selectedCategories: Category[],
  minRequired: number = 10
): boolean {
  return getWordCount(selectedNationalities, selectedCategories) >= minRequired;
}

// Export individual collections for direct access if needed
export {
  shared as sharedWords,
  india as indiaWords,
  nepal as nepalWords,
  bangladesh as bangladeshWords,
  pakistan as pakistanWords,
};
