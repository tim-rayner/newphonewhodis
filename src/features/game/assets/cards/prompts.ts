// Prompt card loader - provides lookup map and deck shuffler
import { type PromptCard, shuffleArray } from "@/features/card";
import PROMPT_DATA from "./prompts-data.json";

// Cast imported JSON to typed array
const promptCards: PromptCard[] = PROMPT_DATA as PromptCard[];

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
