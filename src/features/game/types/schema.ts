// game state snapshot schema
import { z } from "zod";

// Game phases for the state machine
export const gamePhaseSchema = z.enum([
  "LOBBY",
  "DEALT",
  "ANSWERING",
  "JUDGING",
  "ROUND_END",
  "FINISHED",
]);

export type GamePhase = z.infer<typeof gamePhaseSchema>;

export const gameSnapshotSchema = z.object({
  players: z.record(
    z.string(),
    z.object({
      name: z.string(),
      avatar: z.string().nullable(),
      score: z.number(),
      hand: z.array(z.string()),
      submittedCard: z.string().nullable(),
      isHost: z.boolean(),
    })
  ),
  playerOrder: z.array(z.string()),
  round: z.object({
    roundNumber: z.number(),
    promptCard: z.string().nullable(),
    submissions: z.record(z.string(), z.string()),
    judgeId: z.string().nullable(),
    winningPlayerId: z.string().nullable(),
    roundStartAt: z.string().nullable(),
  }),
  decks: z.object({
    prompts: z.array(z.string()),
    responses: z.array(z.string()),
  }),
  settings: z.object({
    maxScore: z.number(),
    handSize: z.number(),
  }),
  phase: gamePhaseSchema,
  // Map of cardId -> gifUrl for GIF cards (assigned server-side when dealt)
  gifUrls: z.record(z.string(), z.string()).default({}),
});

export type GameSnapshotSchema = z.infer<typeof gameSnapshotSchema>;

export const getGameInputSchema = z.object({
  gameId: z.string(),
});

export type GetGameInputSchema = z.infer<typeof getGameInputSchema>;
