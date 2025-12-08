"use client";

import { trpc } from "@/external/trpc/client";
import { GameHeader } from "@/features/game/components/GameHeader";
import { useParams } from "next/navigation";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams<{ id: string }>();
  const { data: game, isLoading } = trpc.game.getGame.useQuery({
    gameId: id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-center">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-center">
            <h1 className="text-xl font-semibold">Game not found</h1>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      </div>
    );
  }

  const host = game.state.players[game.hostId];

  if (!host) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-center">
            <h1 className="text-xl font-semibold">Host not found</h1>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader hostName={host.name} hostAvatar={host.avatar} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
