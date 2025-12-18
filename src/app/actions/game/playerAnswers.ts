"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
import { broadcastGameState } from "@/external/supabase/broadcast";
import { handlePlayerAnswers } from "@/features/game/domain/handlers";
import type { PlayerAnswersPayload } from "@/features/game/types/events";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { eq } from "drizzle-orm";

export async function playerAnswers(payload: PlayerAnswersPayload) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, payload.gameId),
  });

  if (!game) {
    throw new Error("Game not found");
  }

  const newSnapshot = handlePlayerAnswers(
    game.state as GameSnapshotSchema,
    payload
  );

  await db
    .update(games)
    .set({ state: newSnapshot })
    .where(eq(games.id, payload.gameId));

  await broadcastGameState(payload.gameId, newSnapshot);

  return { success: true };
}

