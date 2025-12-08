"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GameHeaderProps {
  hostName: string;
  hostAvatar: string | null;
}

export function GameHeader({ hostName, hostAvatar }: GameHeaderProps) {
  const initials = hostName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            {hostAvatar && (
              <AvatarImage src={hostAvatar} alt={`${hostName}'s avatar`} />
            )}
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-semibold">{hostName}&apos;s phone</h1>
        </div>
      </div>
    </header>
  );
}
