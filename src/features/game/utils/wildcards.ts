// Wildcard card utilities
// Wildcards allow players to write their own custom responses

/** Prefix for all wildcard card IDs */
const WILDCARD_PREFIX = "wildcard_";

/** Chance (0-1) for a dealt card to become a wildcard */
const WILDCARD_CHANCE = 0.1; // 10%

/** Maximum character length for wildcard text */
export const WILDCARD_MAX_LENGTH = 150;

/**
 * Check if a card ID represents a wildcard card
 */
export function isWildcard(cardId: string): boolean {
  return cardId.startsWith(WILDCARD_PREFIX);
}

/**
 * Generate a unique wildcard card ID
 * Uses crypto.randomUUID for uniqueness
 */
export function generateWildcardId(): string {
  // Use first 8 chars of UUID for shorter IDs
  const uniquePart = crypto.randomUUID().slice(0, 8);
  return `${WILDCARD_PREFIX}${uniquePart}`;
}

/**
 * Apply wildcard chance to a list of card IDs
 * Each card has a WILDCARD_CHANCE probability of becoming a wildcard
 *
 * @param cardIds - Array of card IDs to potentially convert
 * @returns New array with some cards replaced by wildcard IDs
 */
export function applyWildcardChance(cardIds: string[]): string[] {
  return cardIds.map((id) =>
    Math.random() < WILDCARD_CHANCE ? generateWildcardId() : id
  );
}

/**
 * Apply wildcard chance to a single card
 * Returns either the original card ID or a new wildcard ID
 */
export function maybeWildcard(cardId: string): string {
  return Math.random() < WILDCARD_CHANCE ? generateWildcardId() : cardId;
}
