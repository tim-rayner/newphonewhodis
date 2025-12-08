"use client";

import { createClient } from "@/external/supabase/client";
import { GameWithState } from "@/shared/types/gameTypes";
import { useEffect, useState } from "react";
import { PlayerList } from "./PlayerList";

export default function GamePageClient({
  initialGame,
}: {
  initialGame: GameWithState;
}) {
  const [game, setGame] = useState(initialGame);
  const supabase = createClient();

  // Convert players record to array for PlayerList
  const players = Object.entries(game.state.players).map(([id, player]) => ({
    id,
    name: player.name,
    avatar: player.avatar,
    score: player.score,
    isHost: player.isHost,
  }));

  //Client Component Subscribes to Realtime
  useEffect(() => {
    console.log(`Subscribing to game channel game-${initialGame.id}`);
    const channel = supabase
      .channel(`game-${initialGame.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${initialGame.id}`,
        },
        (payload) => {
          setGame(payload.new as GameWithState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, initialGame.id]);

  return (
    <div className="relative">
      {/* Player List - positioned top right */}
      <div className="absolute top-0 right-0 z-10">
        <PlayerList players={players} />
      </div>

      {/* Main game content */}
      <div className="pt-20">
        <p className="text-muted-foreground">
          Game: {initialGame.id} - Round {initialGame.state.round.roundNumber}
        </p>
        <pre>{JSON.stringify(initialGame.state, null, 2)}</pre>
      </div>
    </div>
  );
}
