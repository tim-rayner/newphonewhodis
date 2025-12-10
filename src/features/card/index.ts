import PROMPT_DATA from "@/features/game/assets/cards/prompts-data.csv";
import REPLY_DATA from "@/features/game/assets/cards/replies-data.csv";

export const allCards = [...PROMPT_DATA, ...REPLY_DATA];

export const cardMap = Object.fromEntries(allCards.map((c) => [c.id, c]));
