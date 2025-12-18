"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
import { broadcastGameState } from "@/external/supabase/broadcast";
import {
  getShuffledPromptDeck,
  getShuffledReplyDeck,
} from "@/features/game/assets/cards";
import { handleRestartGame } from "@/features/game/domain/handlers";
import type { RestartGamePayload } from "@/features/game/types/events";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { eq } from "drizzle-orm";

export async function restartGame(payload: RestartGamePayload) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, payload.gameId),
  });

  if (!game) {
    throw new Error("Game not found");
  }

  // Get reset snapshot from handler (with empty decks)
  const resetSnapshot = handleRestartGame(
    game.state as GameSnapshotSchema,
    payload
  );

  // Populate fresh shuffled decks
  const newSnapshot: GameSnapshotSchema = {
    ...resetSnapshot,
    decks: {
      prompts: getShuffledPromptDeck(),
      responses: getShuffledReplyDeck(),
    },
  };

  await db
    .update(games)
    .set({ state: newSnapshot })
    .where(eq(games.id, payload.gameId));

  await broadcastGameState(payload.gameId, newSnapshot);

  return { success: true };
}

