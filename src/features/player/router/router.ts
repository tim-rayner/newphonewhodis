import { publicProcedure, router } from "@/external/trpc/init";
import { getActiveHostedGames } from "../api/playerApi";
import { getActiveHostedGamesInputSchema } from "../types/schema";

export const playerRouter = router({
  getActiveHostedGames: publicProcedure
    .input(getActiveHostedGamesInputSchema)
    .query(async ({ input }) => {
      const game = await getActiveHostedGames(input.playerId);
      if (!game) {
        return null;
      }
      return game;
    }),
});
