import { z } from "zod";

export const cardSchema = z.object({
  id: z.uuid("Card ID must be a valid UUID"),
  value: z.string().min(1, "Card value is required"),
  img: z.string().optional(),
  type: z.enum(["prompt", "reply"]),
});

export type Card = z.infer<typeof cardSchema>;

export const promptCardSchema = cardSchema.extend({
  type: z.literal("prompt"),
});
export const replyCardSchema = cardSchema.extend({ type: z.literal("reply") });

export type PromptCard = z.infer<typeof promptCardSchema>;
export type ReplyCard = z.infer<typeof replyCardSchema>;
