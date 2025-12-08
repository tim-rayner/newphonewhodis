// game state snapshot schema
import { z } from "zod";

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
  round: z.object({
    roundNumber: z.number(),
    promptCard: z.string().nullable(),
    submissions: z.record(z.string(), z.string()),
    judgeId: z.string(),
    winningPlayerId: z.string().nullable(),
  }),
  decks: z.object({
    prompts: z.array(z.string()),
    responses: z.array(z.string()),
  }),
  settings: z.object({
    maxScore: z.number(),
    handSize: z.number(),
  }),
});

export type GameSnapshotSchema = z.infer<typeof gameSnapshotSchema>;

export const getGameInputSchema = z.object({
  gameId: z.string(),
});

export type GetGameInputSchema = z.infer<typeof getGameInputSchema>;
