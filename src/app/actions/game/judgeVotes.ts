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
import {
  assignGifUrls,
  getAllDealtCardIds,
  maybeWildcard,
} from "@/features/game/utils";
import { eq } from "drizzle-orm";

export async function judgeVotes(payload: JudgeVotesPayload) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, payload.gameId),
  });

  if (!game) {
    throw new Error("Game not found");
  }

  const currentState = game.state as GameSnapshotSchema;

  // Track cards before the vote to identify replenishment cards later
  const cardsBefore = new Set<string>();
  for (const player of Object.values(currentState.players)) {
    for (const cardId of player.hand) {
      cardsBefore.add(cardId);
    }
  }

  const afterVote = handleJudgeVotes(currentState, payload);

  // Apply wildcard chance to replenishment cards (new cards added after vote)
  let playersWithWildcards = afterVote.players;
  const newPlayers = { ...afterVote.players };
  let hasNewCards = false;

  for (const [playerId, player] of Object.entries(afterVote.players)) {
    const newHand = player.hand.map((cardId) => {
      // If this card wasn't in the hand before, it's a replenishment card
      if (!cardsBefore.has(cardId)) {
        hasNewCards = true;
        return maybeWildcard(cardId);
      }
      return cardId;
    });
    newPlayers[playerId] = { ...player, hand: newHand };
  }

  if (hasNewCards) {
    playersWithWildcards = newPlayers;
  }

  const afterVoteWithWildcards: GameSnapshotSchema = {
    ...afterVote,
    players: playersWithWildcards,
  };

  // If game is finished, just save and broadcast
  if (afterVoteWithWildcards.phase === "FINISHED") {
    await db
      .update(games)
      .set({ state: afterVoteWithWildcards })
      .where(eq(games.id, payload.gameId));

    await broadcastGameState(payload.gameId, afterVoteWithWildcards);
    return { success: true };
  }

  // Game continues - broadcast LOBBY state first so clients see the winner
  await broadcastGameState(payload.gameId, afterVoteWithWildcards);

  // Chain: auto-deal cards for next round (new judge from rotation)
  const afterDeal = handleJudgeDeals(afterVoteWithWildcards, {
    gameId: payload.gameId,
    actorId: afterVoteWithWildcards.round.judgeId!,
  });

  // Chain: auto-start the round
  const afterStart = handleRoundStarts(afterDeal, {
    gameId: payload.gameId,
    actorId: afterDeal.round.judgeId!,
  });

  // Assign GIF URLs to any new cards dealt (replenishment cards + new prompt)
  const allDealtCardIds = getAllDealtCardIds(afterStart.players);

  // Include prompt card in the list of cards to check
  const cardsToCheck = [...allDealtCardIds];
  if (afterStart.round.promptCard) {
    cardsToCheck.push(afterStart.round.promptCard);
  }

  const updatedGifUrls = await assignGifUrls(
    cardsToCheck,
    afterStart.gifUrls ?? {}
  );

  const finalSnapshot: GameSnapshotSchema = {
    ...afterStart,
    gifUrls: updatedGifUrls,
  };

  // Save final state and broadcast
  await db
    .update(games)
    .set({ state: finalSnapshot })
    .where(eq(games.id, payload.gameId));

  await broadcastGameState(payload.gameId, finalSnapshot);

  return { success: true };
}
