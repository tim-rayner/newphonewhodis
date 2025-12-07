import { games } from "@/db/schema/game";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// -----------------------------------------------------------
// ZOD SCHEMAS (Automatic from Drizzle)
// -----------------------------------------------------------
export const gameSchema = createSelectSchema(games);
export const newGameSchema = createInsertSchema(games);
