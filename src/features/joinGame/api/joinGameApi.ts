import { db } from "@/db";
import { games } from "@/db/schema";
import { GameSnapshotSchema } from "@/features/game/types/schema";
import type { Player } from "@/features/player/types/schema";
import { Game } from "@/shared/types/gameTypes";
import { eq } from "drizzle-orm";
import { match, P } from "ts-pattern";

export type UnavailableReason =
  | "not_found"
  | "not_in_lobby"
  | "expired"
  | "already_started"
  | "already_ended"
  | "is_host";

export type JoinGameResult =
  | { success: true; data: Game }
  | { success: false; reason: UnavailableReason; message: string };

export async function joinGame(
  gameCode: string,
  player: Player
): Promise<JoinGameResult> {
  const game = await db.query.games.findFirst({
    where: eq(games.code, gameCode),
  });

  const validationResult = match(game)
    .with(P.nullish, () => ({
      success: false as const,
      reason: "not_found" as const,
      message: "Game not found. Please check the code and try again.",
    }))
    .with({ hostId: player.id }, () => ({
      success: false as const,
      reason: "is_host" as const,
      message: "You are the host of this game.",
    }))
    .with({ phase: P.not("lobby") }, () => ({
      success: false as const,
      reason: "not_in_lobby" as const,
      message: "This game is no longer accepting players.",
    }))
    .with({ expiresAt: P.when((exp) => exp && exp < new Date()) }, () => ({
      success: false as const,
      reason: "expired" as const,
      message: "This game has expired.",
    }))
    .with(
      { startedAt: P.when((started) => started && started < new Date()) },
      () => ({
        success: false as const,
        reason: "already_started" as const,
        message: "This game has already started.",
      })
    )
    .with({ endedAt: P.when((ended) => ended && ended < new Date()) }, () => ({
      success: false as const,
      reason: "already_ended" as const,
      message: "This game has already ended.",
    }))
    .otherwise(() => null);

  if (validationResult) {
    return validationResult;
  }

  // Add player to game (game is guaranteed to exist here)
  const validGame = game!;
  (validGame.state as GameSnapshotSchema).players[player.id] = {
    name: player.name,
    avatar: player.avatar ?? null,
    score: 0,
    hand: [],
    isHost: false,
    submittedCard: null,
  };
  await db
    .update(games)
    .set({ state: validGame.state as GameSnapshotSchema })
    .where(eq(games.id, validGame.id));

  return { success: true, data: validGame };
}

export type CheckAvailabilityResult =
  | { available: true; hostId: string; gameId: string }
  | { available: false; reason: UnavailableReason; message: string };

export async function checkAvailability(
  gameCode: string
): Promise<CheckAvailabilityResult> {
  const game = await db.query.games.findFirst({
    where: eq(games.code, gameCode),
  });

  return match(game)
    .with(P.nullish, () => ({
      available: false as const,
      reason: "not_found" as const,
      message: "Game not found. Please check the code and try again.",
    }))
    .with({ phase: P.not("lobby") }, () => ({
      available: false as const,
      reason: "not_in_lobby" as const,
      message: "This game is no longer accepting players.",
    }))
    .with({ expiresAt: P.when((exp) => exp && exp < new Date()) }, () => ({
      available: false as const,
      reason: "expired" as const,
      message: "This game has expired.",
    }))
    .with(
      { startedAt: P.when((started) => started && started < new Date()) },
      () => ({
        available: false as const,
        reason: "already_started" as const,
        message: "This game has already started.",
      })
    )
    .with({ endedAt: P.when((ended) => ended && ended < new Date()) }, () => ({
      available: false as const,
      reason: "already_ended" as const,
      message: "This game has already ended.",
    }))
    .otherwise(() => ({
      available: true as const,
      hostId: game!.hostId,
      gameId: game!.id,
    }));
}
