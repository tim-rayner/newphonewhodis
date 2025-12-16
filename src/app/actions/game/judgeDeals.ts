"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
import { broadcastGameState } from "@/external/supabase/broadcast";
import { handleJudgeDeals } from "@/features/game/domain/handlers";
import type { JudgeDealsPayload } from "@/features/game/types/events";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import {
  applyWildcardChance,
  assignGifUrls,
  getAllDealtCardIds,
} from "@/features/game/utils";
import { eq } from "drizzle-orm";

export async function judgeDeals(payload: JudgeDealsPayload) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, payload.gameId),
  });

  if (!game) {
    throw new Error("Game not found");
  }

  const currentState = game.state as GameSnapshotSchema;
  const isFirstDeal = currentState.round.roundNumber === 0;

  const afterDeals = handleJudgeDeals(currentState, payload);

  // Apply wildcard chance to newly dealt cards (only on first deal)
  let playersWithWildcards = afterDeals.players;
  if (isFirstDeal) {
    playersWithWildcards = { ...afterDeals.players };
    for (const [playerId, player] of Object.entries(afterDeals.players)) {
      const handWithWildcards = applyWildcardChance(player.hand);
      playersWithWildcards[playerId] = {
        ...player,
        hand: handWithWildcards,
      };
    }
  }

  const snapshotWithWildcards: GameSnapshotSchema = {
    ...afterDeals,
    players: playersWithWildcards,
  };

  // Assign GIF URLs to newly dealt cards (including prompt card)
  const allDealtCardIds = getAllDealtCardIds(snapshotWithWildcards.players);

  // Include prompt card in the list of cards to check
  const cardsToCheck = [...allDealtCardIds];
  if (snapshotWithWildcards.round.promptCard) {
    cardsToCheck.push(snapshotWithWildcards.round.promptCard);
  }

  const updatedGifUrls = await assignGifUrls(
    cardsToCheck,
    snapshotWithWildcards.gifUrls ?? {}
  );

  const newSnapshot: GameSnapshotSchema = {
    ...snapshotWithWildcards,
    gifUrls: updatedGifUrls,
  };

  await db
    .update(games)
    .set({ state: newSnapshot })
    .where(eq(games.id, payload.gameId));

  await broadcastGameState(payload.gameId, newSnapshot);

  return { success: true };
}
