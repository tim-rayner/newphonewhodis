// Reply card loader - parses CSV and provides lookup map and deck shuffler
import {
  parseCardRow,
  type RawCardRow,
  type ReplyCard,
  shuffleArray,
} from "@/features/card";
import REPLY_DATA from "./replies-data.csv";

// Parse all reply cards from CSV
const replyCards: ReplyCard[] = (REPLY_DATA as unknown as RawCardRow[])
  .filter((row) => row.id && row.id.startsWith("reply_"))
  .map((row) => parseCardRow(row) as ReplyCard);

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


