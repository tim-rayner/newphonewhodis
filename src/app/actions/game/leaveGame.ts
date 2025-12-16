"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
import {
  broadcastGameEnded,
  broadcastGameState,
} from "@/external/supabase/broadcast";
import { handleLeaveGame } from "@/features/game/domain/handlers";
import type { LeaveGamePayload } from "@/features/game/types/events";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { eq } from "drizzle-orm";

export async function leaveGame(payload: LeaveGamePayload) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, payload.gameId),
  });

  if (!game) {
    throw new Error("Game not found");
  }

  // Process the leave action
  const result = handleLeaveGame(game.state as GameSnapshotSchema, payload);

  if (result.shouldEndGame) {
    // Host is leaving - end the game for everyone
    await db
      .update(games)
      .set({ endedAt: new Date() })
      .where(eq(games.id, payload.gameId));

    // Broadcast to all players to redirect them home
    await broadcastGameEnded(payload.gameId);

    return { success: true, gameEnded: true };
  }

  // Regular player leaving - update the game state
  await db
    .update(games)
    .set({ state: result.newSnapshot })
    .where(eq(games.id, payload.gameId));

  // Broadcast the updated state to remaining players
  await broadcastGameState(payload.gameId, result.newSnapshot);

  return { success: true, gameEnded: false };
}
