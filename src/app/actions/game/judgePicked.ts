"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
import { handleJudgePicked } from "@/features/game/domain/handlers";
import type { JudgePickedPayload } from "@/features/game/types/events";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { eq } from "drizzle-orm";

export async function judgePicked(payload: JudgePickedPayload) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, payload.gameId),
  });

  if (!game) {
    throw new Error("Game not found");
  }

  const newSnapshot = handleJudgePicked(
    game.state as GameSnapshotSchema,
    payload
  );

  await db
    .update(games)
    .set({ state: newSnapshot })
    .where(eq(games.id, payload.gameId));

  return { success: true };
}


