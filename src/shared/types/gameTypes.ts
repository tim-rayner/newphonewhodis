import { games } from "@/db/schema/game";

// -----------------------------------------------------------
// TYPESCRIPT TYPES (Automatic from Drizzle)
// -----------------------------------------------------------
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
