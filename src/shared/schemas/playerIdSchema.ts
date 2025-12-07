import { z } from "zod";

export const playerIdSchema = z
  .string()
  .regex(/^[a-z]+-[a-z]+-\d{1,2}$/, "Invalid player ID format");

export type PlayerId = z.infer<typeof playerIdSchema>;
