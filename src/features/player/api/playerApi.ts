import { db } from "@/db";
import { games } from "@/db/schema";
import type { Game } from "@/shared/types/gameTypes";
import { eq } from "drizzle-orm";

type Logger = { log: (error: string) => void };
const logger: Logger = { log: (error: string) => console.log(error) };

export async function getActiveHostedGames(
  playerId: string
): Promise<Game | null> {
  if (!playerId) {
    logger.log("Player ID is required");
    return null;
  }

  try {
    const game = await db.query.games.findFirst({
      where: eq(games.hostId, playerId),
    });
    if (!game) {
      return null;
    }
    return game;
  } catch (error) {
    // Log full error details for debugging
    console.error("Full error object:", error);
    console.error(
      "Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.error("Error cause:", (error as any)?.cause);

    const message = error instanceof Error ? error.message : "Unknown error";
    logger.log(message);
    return null;
  }
}
