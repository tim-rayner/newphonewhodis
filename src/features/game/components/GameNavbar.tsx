"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogOut, Menu, Users, XCircle } from "lucide-react";
import { useState } from "react";
import type { ConnectionStatus as ConnectionStatusType } from "../hooks";
import { ConnectionStatus } from "./ConnectionStatus";
import { CountdownTimer } from "./CountdownTimer";
import { GameCodeBadge } from "./mobile/GameCodeBadge";
import { JudgeBanner } from "./mobile/JudgeBanner";

const ROUND_DURATION_SECONDS = 60;

interface Player {
  id: string;
  name: string;
  avatar: string | null;
  score: number;
  isHost?: boolean;
}

interface GameNavbarProps {
  // Game state
  roundNumber: number;
  phase: string;
  roundStartAt: string | null;
  gameCode: string;
  // Players
  players: Player[];
  hostName: string;
  hostAvatar: string | null;
  // Connection
  connectionStatus: ConnectionStatusType;
  onReconnect: () => void;
  // Judge
  judgeName: string | null;
  isCurrentUserJudge: boolean;
  // Menu actions
  isHost: boolean;
  isPending: boolean;
  onEndGame: () => void;
  onLeaveGame: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function GameNavbar({
  roundNumber,
  phase,
  roundStartAt,
  gameCode,
  players,
  hostName,
  hostAvatar,
  connectionStatus,
  onReconnect,
  judgeName,
  isCurrentUserJudge,
  isHost,
  isPending,
  onEndGame,
  onLeaveGame,
}: GameNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const showTimer = phase === "ANSWERING";
  const showJudgeBanner =
    phase !== "LOBBY" && phase !== "FINISHED" && judgeName;

  // Sort players by score (descending) for leaderboard view
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b safe-area-top">
      <div className="container mx-auto px-3 py-2">
        <div className="flex items-center justify-between gap-2 h-12">
          {/* Left: Round indicator */}
          <div className="flex items-center gap-2">
            {roundNumber > 0 && (
              <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-sm font-bold">
                Round #{roundNumber}
              </span>
            )}
          </div>

          {/* Center: Timer (when active) */}
          <div className="flex-1 flex justify-center">
            {showTimer && (
              <CountdownTimer
                startTime={roundStartAt}
                durationSeconds={ROUND_DURATION_SECONDS}
                size="sm"
              />
            )}
          </div>

          {/* Right: Info drawer trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 relative"
              >
                <Menu className="h-5 w-5" />
                {/* Player count badge */}
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {players.length}
                </span>
                <span className="sr-only">Game info</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <SheetHeader className="p-4 pb-2 border-b">
                <SheetTitle className="text-left">Game Info</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-[calc(100%-60px)] overflow-y-auto">
                {/* Host Info */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      {hostAvatar && (
                        <AvatarImage
                          src={hostAvatar}
                          alt={`${hostName}'s avatar`}
                        />
                      )}
                      <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                        {getInitials(hostName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{hostName}&apos;s Phone</p>
                      <p className="text-xs text-muted-foreground">Host</p>
                    </div>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="p-4 border-b">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Connection
                  </p>
                  <ConnectionStatus
                    status={connectionStatus}
                    onReconnect={onReconnect}
                  />
                </div>

                {/* Game Code */}
                <div className="p-4 border-b">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Game Code
                  </p>
                  <GameCodeBadge gameCode={gameCode} variant="default" />
                </div>

                {/* Players List */}
                <div className="p-4 border-b flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Players ({players.length})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {sortedPlayers.map((player, index) => (
                      <div
                        key={player.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg bg-secondary/50",
                          index === 0 &&
                            player.score > 0 &&
                            "border-2 border-amber-500/60"
                        )}
                      >
                        <span className="w-5 text-sm font-medium text-muted-foreground">
                          {index + 1}.
                        </span>
                        <Avatar className="h-8 w-8">
                          {player.avatar && (
                            <AvatarImage
                              src={player.avatar}
                              alt={`${player.name}'s avatar`}
                            />
                          )}
                          <AvatarFallback className="text-xs bg-secondary">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate flex items-center gap-1">
                            {player.name}
                            {player.isHost && (
                              <svg
                                className="h-3 w-3 text-amber-500 inline-block"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L10 17.77L3.82 21.02L5 14.14L0 9.27L6.91 8.26L10 2Z" />
                              </svg>
                            )}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {player.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Game Actions */}
                <div className="p-4 mt-auto space-y-2">
                  {isHost && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={isPending}
                      onClick={() => {
                        setIsOpen(false);
                        onEndGame();
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      End Game
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isPending}
                    onClick={() => {
                      setIsOpen(false);
                      onLeaveGame();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave Game
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Judge Banner - below navbar */}
      {showJudgeBanner && (
        <JudgeBanner
          judgeName={judgeName}
          isCurrentUserJudge={isCurrentUserJudge}
        />
      )}
    </header>
  );
}
