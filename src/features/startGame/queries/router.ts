import { publicProcedure, router } from "@/external/trpc/init";
import { z } from "zod";
import { startGameSchema } from "../types/schema";

export const startGameRouter = router({
  create: publicProcedure.input(startGameSchema).mutation(async ({ input }) => {
    // TODO: Implement game creation logic in API layer
    const gameId = crypto.randomUUID();
    return {
      gameId,
      playerName: input.playerName,
      createdAt: new Date(),
    };
  }),
  getById: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .query(async ({ input }) => {
      // TODO: Implement fetch from database in API layer
      return {
        gameId: input.gameId,
        status: "waiting" as const,
        players: [],
      };
    }),
});
