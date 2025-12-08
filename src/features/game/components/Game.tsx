"use client";

import { trpc } from "@/external/trpc/client";
import { PlayerList } from "./PlayerList";

export default function Game({ gameId }: { gameId: string }) {
  const { data: game } = trpc.game.getGame.useQuery({
    gameId: gameId,
  });

  if (!game) {
    return <div>Game not found</div>;
  }

  // Convert players record to array for PlayerList
  const players = Object.entries(game.state.players).map(([id, player]) => ({
    id,
    name: player.name,
    avatar: player.avatar,
    score: player.score,
    isHost: player.isHost,
  }));

  return (
    <div className="relative">
      {/* Player List - positioned top right */}
      <div className="absolute top-0 right-0 z-10">
        <PlayerList players={players} />
      </div>

      {/* Main game content */}
      <div className="pt-20">
        <p className="text-muted-foreground">
          Game: {game.id} - Round {game.state.round.roundNumber}
        </p>
      </div>
    </div>
  );
}
