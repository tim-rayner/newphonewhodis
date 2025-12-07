import z from "zod";

export const getActiveHostedGamesInputSchema = z.object({
  playerId: z.string().min(1, "Player ID is required"),
});

export type GetActiveHostedGamesInput = z.infer<
  typeof getActiveHostedGamesInputSchema
>;
