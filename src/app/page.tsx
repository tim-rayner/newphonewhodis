"use client"; // TODO: wrap the reactive components in a provider

import { Button } from "@/components/ui/button";
import { trpc } from "@/external/trpc/client";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { MainPageLayout } from "@/shared/layout";
import Link from "next/link";

export default function Home() {
  const playerId = usePlayerIdentity();

  const { data: game } = trpc.player.getActiveHostedGames.useQuery({
    playerId: playerId ?? "",
  });

  return (
    <MainPageLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          New Phone Who Dis
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          Start a new game or join an existing one to play with friends!
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href={game ? `/game/${game.id}` : "/start-game"}>
            {game ? (
              <Button size="lg" className="w-full">
                Resume game
              </Button>
            ) : (
              <Button size="lg" className="w-full">
                Start a new game
              </Button>
            )}
          </Link>
          <Link href="/join-game">
            <Button variant="outline" size="lg" className="w-full">
              Join an existing game
            </Button>
          </Link>
        </div>
      </div>
    </MainPageLayout>
  );
}
