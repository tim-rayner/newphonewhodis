// Reply card loader - provides lookup map and deck shuffler
import { type ReplyCard, shuffleArray } from "@/features/card";
import REPLY_DATA from "./replies-data.json";

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

// Get display text for a card - handles text cards, image cards, and missing cards
export function getReplyDisplayText(
  cardOrId: ReplyCard | string | undefined
): string {
  const card = typeof cardOrId === "string" ? getReplyCard(cardOrId) : cardOrId;
  if (!card) return typeof cardOrId === "string" ? cardOrId : "???";
  if (card.value) return card.value;
  if (card.img)
    return `📷 ${card.img.replace(/\.[^.]+$/, "").replace(/_/g, " ")}`;
  return card.id;
}
