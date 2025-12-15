"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
import { broadcastGameState } from "@/external/supabase/broadcast";
import { handleJudgeVotes } from "@/features/game/domain/handlers";
import type { JudgeVotesPayload } from "@/features/game/types/events";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { eq } from "drizzle-orm";

export async function judgeVotes(payload: JudgeVotesPayload) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, payload.gameId),
  });

  if (!game) {
    throw new Error("Game not found");
  }

  const newSnapshot = handleJudgeVotes(
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
