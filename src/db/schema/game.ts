// drizzle/schema/games.ts
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------------
// ENUM
// -----------------------------------------------------------
export const gamePhaseEnum = pgEnum("game_phase", [
  "lobby",
  "in_round",
  "judging",
  "finished",
]);

// -----------------------------------------------------------
// TABLE
// -----------------------------------------------------------
export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),

  code: varchar("code", { length: 12 }).notNull().unique(),

  hostId: varchar("host_id", { length: 64 }).notNull(),

  phase: gamePhaseEnum("phase").notNull().default("lobby"),

  round: integer("round").notNull().default(0),

  state: jsonb("state").notNull().default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  expiresAt: timestamp("expires_at"),
});
