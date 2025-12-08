import { db } from "@/db";
import { games } from "@/db/schema";
import Game from "@/features/game/components/GamePageClient";
import { gameWithStateSchema } from "@/shared/schemas/gameSchema";
import { eq } from "drizzle-orm";

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await db.query.games.findFirst({
    where: eq(games.id, id),
  });

  //convert game to GameWithState
  const parsedState = gameWithStateSchema.safeParse(game);

  if (!parsedState.success) {
    return <div>Invalid game state</div>;
  }

  return <Game initialGame={parsedState.data} />;
}
