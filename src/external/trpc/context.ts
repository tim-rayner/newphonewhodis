/**
 * tRPC Context
 *
 * Creates the context that is available in all tRPC procedures.
 * Extend this to include auth, database connections, etc.
 */

export async function createContext() {
  return {
    // Add context properties here as needed:
    // - session/user from auth
    // - database connection
    // - request headers
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;




