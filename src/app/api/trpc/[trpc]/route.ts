/**
 * tRPC API Route Handler
 *
 * Next.js App Router handler for tRPC requests.
 * All tRPC requests go through this endpoint.
 */

import { createContext } from "@/external/trpc/context";
import { appRouter } from "@/external/trpc/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };





