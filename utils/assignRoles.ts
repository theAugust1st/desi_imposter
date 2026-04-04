import type { Player } from '../types';

interface AssignRolesResult {
  players: Player[];
  imposterIndex: number;
}

/**
 * Assigns roles to players - one random imposter, rest are villagers
 * @param players - Array of players to assign roles to
 * @returns Updated players array and the imposter's index
 */
export function assignRoles(players: Player[]): AssignRolesResult {
  if (players.length < 3) {
    throw new Error('Need at least 3 players to assign roles');
  }

  // Select random imposter
  const imposterIndex = Math.floor(Math.random() * players.length);

  // Update players with imposter role
  const updatedPlayers = players.map((player, index) => ({
    ...player,
    isImposter: index === imposterIndex,
  }));

  return {
    players: updatedPlayers,
    imposterIndex,
  };
}

/**
 * Creates initial player objects from names
 * @param names - Array of player names
 * @returns Array of Player objects (all with isImposter: false initially)
 */
export function createPlayers(names: string[]): Player[] {
  return names.map((name, index) => ({
    id: `player_${index}`,
    name: name.trim(),
    isImposter: false,
  }));
}

/**
 * Validates player count
 * @param count - Number of players
 * @returns true if valid (3-10 players)
 */
export function isValidPlayerCount(count: number): boolean {
  return count >= 3 && count <= 10;
}

export default assignRoles;
