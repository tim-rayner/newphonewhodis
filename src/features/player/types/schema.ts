import z from "zod";

export const getActiveHostedGamesInputSchema = z.object({
  playerId: z.string().min(1, "Player ID is required"),
});

export type GetActiveHostedGamesInput = z.infer<
  typeof getActiveHostedGamesInputSchema
>;

export const playerSchema = z.object({
  id: z.string().min(1, "Player ID is required"),
  name: z.string().min(1, "Player name is required"),
  avatar: z.string().optional(),
});

export type Player = z.infer<typeof playerSchema>;
