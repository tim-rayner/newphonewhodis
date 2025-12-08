/**
 * Root tRPC Router
 *
 * Merges all feature routers into a single app router.
 * This is the main entry point for the tRPC API.
 */

import { gameRouter } from "@/features/game/queries/router";
import { joinGameRouter } from "@/features/joinGame/queries/router";
import { playerRouter } from "@/features/player/router/router";
import { startGameRouter } from "@/features/startGame/queries/router";
import { router } from "./init";

export const appRouter = router({
  startGame: startGameRouter,
  joinGame: joinGameRouter,
  player: playerRouter,
  game: gameRouter,
});

/**
 * AppRouter type - used for client-side type inference
 */
export type AppRouter = typeof appRouter;
