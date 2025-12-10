/**
 * tRPC React Client
 *
 * Provides typed hooks for calling tRPC procedures from React components.
 * Import `trpc` from this file to use in your components.
 */

"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./router";

/**
 * tRPC React hooks - use this in your components
 *
 * @example
 * ```tsx
 * import { trpc } from '@/external/trpc/client';
 *
 * function MyComponent() {
 *   const createGame = trpc.startGame.create.useMutation();
 *   const { data } = trpc.startGame.getById.useQuery({ gameId: '...' });
 * }
 * ```
 */
export const trpc = createTRPCReact<AppRouter>();


