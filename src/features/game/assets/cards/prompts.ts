// Prompt card loader - parses CSV and provides lookup map and deck shuffler
import {
  parseCardRow,
  type PromptCard,
  type RawCardRow,
  shuffleArray,
} from "@/features/card";
import PROMPT_DATA from "./prompts-data.csv";

// Parse all prompt cards from CSV
const promptCards: PromptCard[] = (PROMPT_DATA as unknown as RawCardRow[])
  .filter((row) => row.id && row.id.startsWith("prompt_"))
  .map((row) => parseCardRow(row) as PromptCard);

// Lookup map: id -> PromptCard
export const PROMPT_CARDS_BY_ID = new Map<string, PromptCard>(
  promptCards.map((card) => [card.id, card])
);

// Get all prompt card IDs
export function getAllPromptIds(): string[] {
  return promptCards.map((card) => card.id);
}

// Get a shuffled deck of prompt card IDs
export function getShuffledPromptDeck(): string[] {
  return shuffleArray(getAllPromptIds());
}

// Get a prompt card by ID (for rendering text from ID)
export function getPromptCard(id: string): PromptCard | undefined {
  return PROMPT_CARDS_BY_ID.get(id);
}
