import { db } from "@/db";
import { games } from "@/db/schema";
import type { Game } from "@/shared/types/gameTypes";
import { eq } from "drizzle-orm";
import { generateUniqueGameCode } from "../utils/generateGameCode";

type Logger = { log: (error: string) => void };
const logger: Logger = { log: (error: string) => console.log(error) };

type StartGameResult = {
  success: boolean;
  data?: Game;
  error?: string;
};

export async function startGame(
  hostId: string,
  name: string,
  avatar?: string
): Promise<StartGameResult> {
  try {
    // 1. Check if a game already exists with the same hostId
    const existingGame = await db.query.games.findFirst({
      where: eq(games.hostId, hostId),
    });
    if (existingGame) {
      throw new Error("You are already in a game");
    }

    // 2. Generate a unique game code
    const code = await generateUniqueGameCode();

    // 3. Build host player entry
    const hostPlayer = {
      name,
      avatar: avatar ?? null,
      score: 0,
      hand: [],
      submittedCard: null,
      isHost: true,
    };

    // 3. Build initial state snapshot
    const initialState = {
      players: {
        [hostId]: hostPlayer,
      },
      round: {
        roundNumber: 0,
        promptCard: null,
        submissions: {},
        judgeId: hostId,
        winningPlayerId: null,
      },
      decks: {
        prompts: [],
        responses: [],
      },
      settings: {
        maxScore: 7,
        handSize: 7,
      },
    };

    // 4. Create game in DB
    const [game] = await db
      .insert(games)
      .values({
        code,
        hostId,
        phase: "lobby",
        round: 0,
        state: initialState,
      })
      .returning();

    return { success: true, data: game };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.log(message);

    return {
      success: false,
      error: message,
    };
  }
}
