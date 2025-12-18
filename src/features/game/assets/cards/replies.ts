// Reply card loader - provides lookup map and deck shuffler
import { type ReplyCard, shuffleArray } from "@/features/card";
import { isWildcard } from "@/features/game/utils/wildcards";
import REPLY_DATA from "./replies-data.json";

// Re-export isWildcard for convenience
export { isWildcard };

// Cast imported JSON to typed array
const replyCards: ReplyCard[] = REPLY_DATA as ReplyCard[];

// Lookup map: id -> ReplyCard
export const REPLY_CARDS_BY_ID = new Map<string, ReplyCard>(
  replyCards.map((card) => [card.id, card])
);

// Get all reply card IDs
export function getAllReplyIds(): string[] {
  return replyCards.map((card) => card.id);
}

// Get a shuffled deck of reply card IDs
export function getShuffledReplyDeck(): string[] {
  return shuffleArray(getAllReplyIds());
}

// Get a reply card by ID (for rendering text from ID)
export function getReplyCard(id: string): ReplyCard | undefined {
  return REPLY_CARDS_BY_ID.get(id);
}

/**
 * Get display text for a card - handles text cards, image cards, wildcards, and missing cards
 * @param cardOrId - Card object or card ID string
 * @param wildcardTexts - Optional map of wildcard ID -> custom text (from game state)
 */
export function getReplyDisplayText(
  cardOrId: ReplyCard | string | undefined,
  wildcardTexts?: Record<string, string>
): string {
  const cardId = typeof cardOrId === "string" ? cardOrId : cardOrId?.id;

  // Handle wildcard cards
  if (cardId && isWildcard(cardId)) {
    const customText = wildcardTexts?.[cardId];
    // Return custom text if set, otherwise empty (UI will show input prompt)
    return customText ?? "";
  }

  const card = typeof cardOrId === "string" ? getReplyCard(cardOrId) : cardOrId;
  if (!card) return typeof cardOrId === "string" ? cardOrId : "???";
  if (card.value) return card.value;
  // GIF-only cards (img === "gif" with no value) should show empty text
  // The GIF will be displayed separately by the component
  if (card.img === "gif") return "";
  // Other image cards show the image filename
  if (card.img)
    return `📷 ${card.img.replace(/\.[^.]+$/, "").replace(/_/g, " ")}`;
  return card.id;
}

