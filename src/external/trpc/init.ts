/**
 * tRPC Initialization
 *
 * This file initializes tRPC and exports the building blocks
 * that all feature routers use. Features should import from here
 * to create their routers with the shared procedure.
 */

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Router factory - used to create routers in each feature
 */
export const router = t.router;

/**
 * Public procedure - the single shared procedure for all features
 * All feature routers should use this procedure as their base.
 */
export const publicProcedure = t.procedure;

/**
 * Middleware factory - for creating reusable middleware
 */
export const middleware = t.middleware;
