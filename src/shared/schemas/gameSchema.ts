import { games } from "@/db/schema/game";
import { gameSnapshotSchema } from "@/features/game/types/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// -----------------------------------------------------------
// ZOD SCHEMAS (Automatic from Drizzle)
// -----------------------------------------------------------
export const gameSchema = createSelectSchema(games);
export const newGameSchema = createInsertSchema(games);
export const gameWithStateSchema = gameSchema.extend({
  state: gameSnapshotSchema,
});
