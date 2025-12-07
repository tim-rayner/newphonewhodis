/**
 * Root tRPC Router
 *
 * Merges all feature routers into a single app router.
 * This is the main entry point for the tRPC API.
 */

import { joinGameRouter } from "@/features/joinGame/queries/router";
import { startGameRouter } from "@/features/startGame/queries/router";
import { router } from "./init";

export const appRouter = router({
  startGame: startGameRouter,
  joinGame: joinGameRouter,
});

/**
 * AppRouter type - used for client-side type inference
 */
export type AppRouter = typeof appRouter;
