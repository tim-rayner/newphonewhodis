"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
import { GameSnapshotSchema } from "@/features/game/types/schema";
import { eq } from "drizzle-orm";

export async function playCard({
  gameId,
  playerId,
  cardId,
}: {
  gameId: string;
  playerId: string;
  cardId: string;
}) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
  });

  if (!game) throw new Error("Game not found");

  const state = game.state as GameSnapshotSchema;

  // ---- GAME RULES ----
  // 1. Player must have that card in hand
  const player = state.players[playerId];
  if (!player) throw new Error("Player not in this game");

  if (!player.hand.includes(cardId)) {
    throw new Error("Player attempted to play a card they don't have");
  }

  // 2. Cannot play twice in one round
  const alreadyPlayed = state.round.submissions[playerId];

  if (alreadyPlayed) {
    throw new Error("Player has already submitted a reply this round");
  }

  // ---- APPLY MUTATION ----
  const newSnapshot = structuredClone(state);

  // Remove card from player's hand
  newSnapshot.players[playerId] = {
    ...player,
    hand: player.hand.filter((id) => id !== cardId),
  };

  // Add card to round responses
  newSnapshot.round.submissions[playerId] = cardId;

  // Save to DB → triggers Supabase Realtime
  await db
    .update(games)
    .set({ state: newSnapshot })
    .where(eq(games.id, gameId));

  return { success: true };
}
