import { db } from "@/db";
import { games } from "@/db/schema";
import {
  getShuffledPromptDeck,
  getShuffledReplyDeck,
} from "@/features/game/assets/cards";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
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
    console.log("------ Looking for existing game with hostId: ", hostId);
    // 1. Check if a game already exists with the same hostId
    const existingGame = await db.query.games.findFirst({
      where: eq(games.hostId, hostId),
    });
    console.log("------ Existing game found: ", existingGame);
    if (existingGame) {
      throw new Error("You are already in a game");
    }

    console.log("------ No existing game found with hostId: ", hostId);

    // 2. Generate a unique game code
    const code = await generateUniqueGameCode();

    console.log("------ Generated unique game code: ", code);

    // 3. Build host player record entry
    const hostPlayer = {
      name,
      avatar: avatar ?? null,
      score: 0,
      hand: [],
      submittedCard: null,
      isHost: true,
    };

    console.log("------ Built host player record entry: ", hostPlayer);

    // 3. Build initial state snapshot
    const initialState: GameSnapshotSchema = {
      players: {
        [hostId]: hostPlayer,
      },
      playerOrder: [hostId],
      round: {
        roundNumber: 0,
        promptCard: null,
        submissions: {},
        judgeId: null,
        winningPlayerId: null,
        roundStartAt: null,
      },
      decks: {
        prompts: getShuffledPromptDeck(),
        responses: getShuffledReplyDeck(),
      },
      settings: {
        maxScore: 7,
        handSize: 7,
      },
      phase: "LOBBY",
      gifUrls: {},
      wildcardTexts: {},
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
    // Log full error details for debugging
    console.error("Full error object:", error);
    console.error(
      "Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.error("Error cause:", (error as Error)?.cause);

    const message = error instanceof Error ? error.message : "Unknown error";
    logger.log(message);

    return {
      success: false,
      error: message,
    };
  }
}
