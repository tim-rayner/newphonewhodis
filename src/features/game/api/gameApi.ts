import { db } from "@/db";
import { games } from "@/db/schema";
import { GameWithState } from "@/shared/types/gameTypes";
import { eq } from "drizzle-orm";
import { gameSnapshotSchema } from "../types/schema";

type Logger = { log: (error: string) => void };

const logger: Logger = { log: (error: string) => console.log(error) };

export async function getGame(gameId: string): Promise<GameWithState | null> {
  try {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });
    if (!game) {
      return null;
    }

    const parsedState = gameSnapshotSchema.safeParse(game.state);
    if (!parsedState.success) {
      return null;
    }

    return {
      ...game,
      state: parsedState.data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.log(message);
    return null;
  }
}
