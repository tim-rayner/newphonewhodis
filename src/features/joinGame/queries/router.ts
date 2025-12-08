/**
 * joinGame Feature Router
 *
 * Handles all tRPC procedures related to joining an existing game.
 */

import { publicProcedure, router } from "@/external/trpc/init";
import { getRandomMemeUrl } from "@/features/startGame/queries/router";
import { z } from "zod";
import { checkAvailability, joinGame } from "../api/joinGameApi";
import { joinGameSchema } from "../types/schema";

export const joinGameRouter = router({
  /**
   * Join an existing game
   */
  join: publicProcedure.input(joinGameSchema).mutation(async ({ input }) => {
    const memeUrl = await getRandomMemeUrl(); // random meme url for the avatar;
    input.player.avatar = memeUrl;
    const result = await joinGame(input.gameCode, input.player);
    return result;
  }),

  /**
   * Check if a game exists and is joinable
   */
  checkAvailability: publicProcedure
    .input(z.object({ gameCode: z.string().min(1, "Game code is required") }))
    .mutation(async ({ input }) => {
      const result = await checkAvailability(input.gameCode);
      return result;
    }),
});
