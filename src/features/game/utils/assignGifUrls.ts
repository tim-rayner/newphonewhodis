// Server-side utility for assigning GIF URLs to cards
// Called when cards are dealt to ensure all players see the same GIF

import { getReplyCard } from "@/features/game/assets/cards";
import { fetchRandomGif, PLACEHOLDER_GIF_URL } from "./giphy";

/**
 * Check if a card is a GIF card that needs a URL assigned
 */
function isGifCard(cardId: string): boolean {
  const card = getReplyCard(cardId);
  return card?.img === "gif";
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
  console.log("[assignGifUrls] Checking cards:", cardIds.length);
  console.log("[assignGifUrls] Existing gifUrls count:", Object.keys(existingGifUrls).length);
  
  // Find GIF cards that need URLs assigned
  const gifCardIds = cardIds.filter((cardId) => isGifCard(cardId));
  console.log("[assignGifUrls] GIF cards found:", gifCardIds);
  
  const cardsNeedingGifs = gifCardIds.filter((cardId) => !existingGifUrls[cardId]);
  console.log("[assignGifUrls] Cards needing new GIFs:", cardsNeedingGifs);

  if (cardsNeedingGifs.length === 0) {
    console.log("[assignGifUrls] No new GIFs needed, returning existing");
    return existingGifUrls;
  }

  console.log(
    `[assignGifUrls] Fetching GIFs for ${cardsNeedingGifs.length} cards:`,
    cardsNeedingGifs
  );

  // Fetch GIFs in parallel
  const gifResults = await Promise.all(
    cardsNeedingGifs.map(async (cardId) => {
      console.log(`[assignGifUrls] Fetching GIF for ${cardId}...`);
      const url = await fetchRandomGif();
      console.log(`[assignGifUrls] Got URL for ${cardId}:`, url ? url.slice(0, 60) : "null (using placeholder)");
      return { cardId, url: url || PLACEHOLDER_GIF_URL };
    })
  );

  // Merge new URLs into existing map
  const newGifUrls = { ...existingGifUrls };
  for (const { cardId, url } of gifResults) {
    newGifUrls[cardId] = url;
    console.log(`[assignGifUrls] Assigned GIF for ${cardId}: ${url.slice(0, 50)}...`);
  }

  console.log("[assignGifUrls] Final gifUrls count:", Object.keys(newGifUrls).length);
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

