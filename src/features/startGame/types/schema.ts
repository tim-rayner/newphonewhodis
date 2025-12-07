import { z } from "zod";

export const startGameSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
});

export type StartGameInput = z.infer<typeof startGameSchema>;
