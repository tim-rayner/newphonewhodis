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

  // Assign GIF URLs to newly dealt cards (including prompt card)
  const allDealtCardIds = getAllDealtCardIds(afterDeals.players);

  // Include prompt card in the list of cards to check
  const cardsToCheck = [...allDealtCardIds];
  if (afterDeals.round.promptCard) {
    cardsToCheck.push(afterDeals.round.promptCard);
  }

  const updatedGifUrls = await assignGifUrls(
    cardsToCheck,
    afterDeals.gifUrls ?? {}
  );

  const newSnapshot: GameSnapshotSchema = {
    ...afterDeals,
    gifUrls: updatedGifUrls,
  };

  await db
    .update(games)
    .set({ state: newSnapshot })
    .where(eq(games.id, payload.gameId));

  await broadcastGameState(payload.gameId, newSnapshot);

  return { success: true };
}
