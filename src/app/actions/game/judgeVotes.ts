"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
import { broadcastGameState } from "@/external/supabase/broadcast";
import {
  handleJudgeDeals,
  handleJudgeVotes,
  handleRoundStarts,
} from "@/features/game/domain/handlers";
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

  const afterVote = handleJudgeVotes(game.state as GameSnapshotSchema, payload);

  // If game is finished, just save and broadcast
  if (afterVote.phase === "FINISHED") {
    await db
      .update(games)
      .set({ state: afterVote })
      .where(eq(games.id, payload.gameId));

    await broadcastGameState(payload.gameId, afterVote);
    return { success: true };
  }

  // Game continues - broadcast LOBBY state first so clients see the winner
  await broadcastGameState(payload.gameId, afterVote);

  // Chain: auto-deal cards for next round (new judge from rotation)
  const afterDeal = handleJudgeDeals(afterVote, {
    gameId: payload.gameId,
    actorId: afterVote.round.judgeId!,
  });

  // Chain: auto-start the round
  const afterStart = handleRoundStarts(afterDeal, {
    gameId: payload.gameId,
    actorId: afterDeal.round.judgeId!,
  });

  // Save final state and broadcast
  await db
    .update(games)
    .set({ state: afterStart })
    .where(eq(games.id, payload.gameId));

  await broadcastGameState(payload.gameId, afterStart);

  return { success: true };
}
