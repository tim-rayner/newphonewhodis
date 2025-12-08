"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Player {
  id: string;
  name: string;
  avatar: string | null;
  score: number;
  isHost?: boolean;
}

interface PlayerListProps {
  players: Player[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PlayerList({ players }: PlayerListProps) {
  if (players.length === 0) {
    return null;
  }

  return (
    <Card className="px-4 py-3 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Players ({players.length})
        </span>
        <div className="flex -space-x-2">
          {players.map((player) => (
            <HoverCard key={player.id} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-transform hover:scale-110 hover:z-10">
                  <Avatar className="h-10 w-10 border-2 border-background ring-1 ring-border/50">
                    {player.avatar && (
                      <AvatarImage
                        src={player.avatar}
                        alt={`${player.name}'s avatar`}
                      />
                    )}
                    <AvatarFallback className="text-xs font-medium bg-secondary text-secondary-foreground">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  {player.isHost && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-2 ring-background">
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L10 17.77L3.82 21.02L5 14.14L0 9.27L6.91 8.26L10 2Z" />
                      </svg>
                    </span>
                  )}
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto min-w-[180px] p-4" side="top">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-20 w-20 ring-2 ring-border">
                    {player.avatar && (
                      <AvatarImage
                        src={player.avatar}
                        alt={`${player.name}'s avatar`}
                      />
                    )}
                    <AvatarFallback className="text-2xl font-medium bg-secondary text-secondary-foreground">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      {player.name}
                      {player.isHost && (
                        <svg
                          className="h-3.5 w-3.5 text-amber-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L10 17.77L3.82 21.02L5 14.14L0 9.27L6.91 8.26L10 2Z" />
                        </svg>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Score: {player.score}
                    </span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </Card>
  );
}
