import { db } from "@/db";
import { games } from "@/db/schema";
import { broadcastGameEnded } from "@/external/supabase/broadcast";
import { publicProcedure, router } from "@/external/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { getGame } from "../api/gameApi";
import {
  deleteGameInputSchema,
  type GameSnapshotSchema,
  getGameInputSchema,
} from "../types/schema";

function getHostId(snapshot: GameSnapshotSchema): string | null {
  for (const [playerId, player] of Object.entries(snapshot.players)) {
    if (player.isHost) return playerId;
  }
  return null;
}

export const gameRouter = router({
  getGame: publicProcedure
    .input(getGameInputSchema)
    .query(async ({ input }) => {
      const game = await getGame(input.gameId);
      return game;
    }),

  /**
   * Delete a game - only the host can delete their own game
   * Only allowed during LOBBY, DEALT, or FINISHED phases
   */
  deleteGame: publicProcedure
    .input(deleteGameInputSchema)
    .mutation(async ({ input }) => {
      const { gameId, actorId } = input;

      // Fetch the game
      const game = await db.query.games.findFirst({
        where: eq(games.id, gameId),
      });

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      const state = game.state as GameSnapshotSchema;

      // Validate the actor is the host
      const hostId = getHostId(state);
      if (actorId !== hostId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the host can end the game",
        });
      }

      // Broadcast game_ended to all players before deleting
      await broadcastGameEnded(gameId);

      // Delete the game from the database
      await db.delete(games).where(eq(games.id, gameId));

      return { success: true };
    }),
});
