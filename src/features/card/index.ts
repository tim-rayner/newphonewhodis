// Card type definitions for the game
// Cards are stored in CSV files and loaded at build time

export type CardType = "prompt" | "reply";

export interface BaseCard {
  id: string;
  value: string;
  type: CardType;
  img: string | null;
}

export interface PromptCard extends BaseCard {
  type: "prompt";
}

export interface ReplyCard extends BaseCard {
  type: "reply";
}

export type Card = PromptCard | ReplyCard;

// Raw CSV row shape (all fields are strings from CSV)
export interface RawCardRow {
  id: string;
  value: string;
  type: string;
  img: string;
}

// Helper to parse a raw CSV row into a typed card
export function parseCardRow(row: RawCardRow): Card {
  return {
    id: row.id,
    value: row.value,
    type: row.type as CardType,
    img: row.img || null,
  };
}

// Fisher-Yates shuffle algorithm for creating randomized decks
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
