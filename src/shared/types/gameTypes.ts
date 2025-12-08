import { games } from "@/db/schema/game";
import { GameSnapshotSchema } from "@/features/game/types/schema";

// -----------------------------------------------------------
// TYPESCRIPT TYPES (Automatic from Drizzle)
// -----------------------------------------------------------
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

// Game with properly typed state from Zod schema
export type GameWithState = Omit<Game, "state"> & { state: GameSnapshotSchema };
