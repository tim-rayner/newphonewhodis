import { playerSchema } from "@/features/player/types/schema";
import { z } from "zod";

// Schema for step 1: checking game availability
export const checkAvailabilitySchema = z.object({
  gameCode: z.string().min(1, "Game code is required"),
});

export type CheckAvailabilitySchema = z.infer<typeof checkAvailabilitySchema>;

// Schema for step 2: entering player name
export const playerNameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type PlayerNameSchema = z.infer<typeof playerNameSchema>;

// Schema for joining a game (full payload)
export const joinGameSchema = z.object({
  gameCode: z.string().min(1, "Game code is required"),
  player: playerSchema,
});

export type JoinGameSchema = z.infer<typeof joinGameSchema>;
