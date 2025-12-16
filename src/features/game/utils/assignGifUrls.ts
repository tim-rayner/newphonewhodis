// Server-side utility for assigning GIF URLs to cards
// Called when cards are dealt to ensure all players see the same GIF

import { getPromptCard, getReplyCard } from "@/features/game/assets/cards";
import { fetchRandomGif, PLACEHOLDER_GIF_URL } from "./giphy";

/**
 * Check if a card is a GIF card that needs a URL assigned
 * Works for both prompt and reply cards
 */
function isGifCard(cardId: string): boolean {
  // Check reply cards first
  const replyCard = getReplyCard(cardId);
  if (replyCard?.img === "gif") return true;
  
  // Check prompt cards
  const promptCard = getPromptCard(cardId);
  if (promptCard?.img === "gif") return true;
  
  return false;
}

/**
 * Assigns GIF URLs to newly dealt cards that don't already have URLs
 *
 * @param cardIds - Array of card IDs to check and potentially assign GIFs
 * @param existingGifUrls - Current gifUrls map from game state
 * @returns Updated gifUrls map with new assignments
 */
export async function assignGifUrls(
  cardIds: string[],
  existingGifUrls: Record<string, string> = {}
): Promise<Record<string, string>> {
  // Find GIF cards that need URLs assigned
  const gifCardIds = cardIds.filter((cardId) => isGifCard(cardId));
  const cardsNeedingGifs = gifCardIds.filter((cardId) => !existingGifUrls[cardId]);

  console.log(`[assignGifUrls] Total cards: ${cardIds.length}, GIF cards: ${gifCardIds.length}, needing URLs: ${cardsNeedingGifs.length}`);

  if (cardsNeedingGifs.length === 0) {
    return existingGifUrls;
  }

  // Fetch GIFs in parallel
  const gifResults = await Promise.all(
    cardsNeedingGifs.map(async (cardId) => {
      const url = await fetchRandomGif();
      return { cardId, url: url || PLACEHOLDER_GIF_URL };
    })
  );

  // Merge new URLs into existing map
  const newGifUrls = { ...existingGifUrls };
  for (const { cardId, url } of gifResults) {
    newGifUrls[cardId] = url;
  }

  console.log(`[assignGifUrls] Assigned ${gifResults.length} GIF URLs. Total URLs now: ${Object.keys(newGifUrls).length}`);
  
  return newGifUrls;
}

/**
 * Collects all card IDs that were dealt to players in a snapshot
 * Used to identify which cards need GIF URLs assigned
 */
export function getAllDealtCardIds(players: Record<string, { hand: string[] }>): string[] {
  const allCards: string[] = [];
  for (const player of Object.values(players)) {
    allCards.push(...player.hand);
  }
  return allCards;
}

