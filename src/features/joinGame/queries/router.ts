/**
 * joinGame Feature Router
 *
 * Handles all tRPC procedures related to joining an existing game.
 */

import { publicProcedure, router } from "@/external/trpc/init";
import { z } from "zod";

export const joinGameRouter = router({
  /**
   * Join an existing game
   */
  join: publicProcedure
    .input(
      z.object({
        gameId: z.string().uuid("Invalid game ID"),
        playerName: z.string().min(1, "Player name is required"),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implement join game logic
      return {
        success: true,
        gameId: input.gameId,
        playerName: input.playerName,
        joinedAt: new Date(),
      };
    }),

  /**
   * Check if a game exists and is joinable
   */
  checkAvailability: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .query(async ({ input }) => {
      // TODO: Implement availability check
      return {
        gameId: input.gameId,
        available: true,
        currentPlayers: 1,
        maxPlayers: 10,
      };
    }),
});
