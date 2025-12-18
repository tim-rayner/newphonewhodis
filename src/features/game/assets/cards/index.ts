// Card utilities barrel export
// Re-exports all card-related functions and maps

import type { Card } from "@/features/card";

export {
  getAllPromptIds,
  getPromptCard,
  getShuffledPromptDeck,
  PROMPT_CARDS_BY_ID,
} from "./prompts";

export {
  getAllReplyIds,
  getReplyCard,
  getReplyDisplayText,
  getShuffledReplyDeck,
  isWildcard,
  REPLY_CARDS_BY_ID,
} from "./replies";

// Re-export types from the card feature
export type { Card, PromptCard, ReplyCard } from "@/features/card";

/**
 * Check if a card has an image/GIF attached
 */
export function cardHasImage(card: Card | undefined | null): boolean {
  return !!card?.img;
}

