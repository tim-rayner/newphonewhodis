import { publicProcedure, router } from "@/external/trpc/init";
import { TRPCError } from "@trpc/server";
import { startGame } from "../api/startGameApi";
import { startGameSchema } from "../types/schema";

export async function getRandomMemeUrl(): Promise<string> {
  try {
    const res = await fetch("https://meme-api.com/gimme");
    const data = await res.json();
    return data.url;
  } catch {
    return "https://api.memegen.link/images/doge/wow/such_meme.png"; // fallback
  }
}

export const startGameRouter = router({
  create: publicProcedure.input(startGameSchema).mutation(async ({ input }) => {
    const memeUrl = await getRandomMemeUrl(); // random meme url for the avatar;
    console.log("-------> memeUrl", memeUrl);
    const game = await startGame(input.playerId, input.playerName, memeUrl);
    if (!game.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: game.error ?? "Failed to start game",
      });
    }
    return game.data;
  }),
});
