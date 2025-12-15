"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
import { broadcastGameState } from "@/external/supabase/broadcast";
import { handleJudgeDeals } from "@/features/game/domain/handlers";
import type { JudgeDealsPayload } from "@/features/game/types/events";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { assignGifUrls, getAllDealtCardIds } from "@/features/game/utils";
import { eq } from "drizzle-orm";

export async function judgeDeals(payload: JudgeDealsPayload) {
  console.log("[judgeDeals] Starting...");

  const game = await db.query.games.findFirst({
    where: eq(games.id, payload.gameId),
  });

  if (!game) {
    throw new Error("Game not found");
  }

  const afterDeals = handleJudgeDeals(
    game.state as GameSnapshotSchema,
    payload
  );

  // Assign GIF URLs to newly dealt cards
  const allDealtCardIds = getAllDealtCardIds(afterDeals.players);
  console.log("[judgeDeals] All dealt card IDs:", allDealtCardIds);
  console.log("[judgeDeals] Existing gifUrls:", afterDeals.gifUrls);

  const updatedGifUrls = await assignGifUrls(
    allDealtCardIds,
    afterDeals.gifUrls ?? {}
  );

  console.log("[judgeDeals] Updated gifUrls:", updatedGifUrls);
  console.log("[judgeDeals] gifUrls keys:", Object.keys(updatedGifUrls));

  const newSnapshot: GameSnapshotSchema = {
    ...afterDeals,
    gifUrls: updatedGifUrls,
  };

  await db
    .update(games)
    .set({ state: newSnapshot })
    .where(eq(games.id, payload.gameId));

  await broadcastGameState(payload.gameId, newSnapshot);

  console.log(
    "[judgeDeals] Complete. gifUrls saved:",
    Object.keys(newSnapshot.gifUrls).length
  );

  return { success: true };
}
