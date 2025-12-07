import { z } from "zod";

// Full schema used by tRPC endpoint
export const startGameSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  playerId: z.string().min(1, "Player ID is required"),
});

// Form-only schema (playerId is added separately from usePlayerIdentity)
export const startGameFormSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
});

export type StartGameInput = z.infer<typeof startGameSchema>;
export type StartGameFormInput = z.infer<typeof startGameFormSchema>;
