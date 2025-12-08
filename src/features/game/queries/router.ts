import { publicProcedure, router } from "@/external/trpc/init";
import { getGame } from "../api/gameApi";
import { getGameInputSchema } from "../types/schema";

export const gameRouter = router({
  getGame: publicProcedure
    .input(getGameInputSchema)
    .query(async ({ input }) => {
      const game = await getGame(input.gameId);
      return game;
    }),
});
