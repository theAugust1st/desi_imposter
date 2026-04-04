import type { Player } from '../types';

/**
 * Picks a random player to go first in the discussion phase
 * @param players - Array of players
 * @returns Index of the player who should speak first
 */
export function pickFirstPlayer(players: Player[]): number {
  if (players.length === 0) {
    throw new Error('Cannot pick first player from empty array');
  }
  return Math.floor(Math.random() * players.length);
}

/**
 * Picks a random player excluding specific indices
 * Useful for picking someone other than the imposter to go first
 * @param players - Array of players
 * @param excludeIndices - Indices to exclude from selection
 * @returns Index of the selected player
 */
export function pickFirstPlayerExcluding(
  players: Player[],
  excludeIndices: number[]
): number {
  const availableIndices = players
    .map((_, index) => index)
    .filter((index) => !excludeIndices.includes(index));

  if (availableIndices.length === 0) {
    // Fallback to any player if all are excluded
    return Math.floor(Math.random() * players.length);
  }

  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  return availableIndices[randomIndex];
}

export default pickFirstPlayer;
