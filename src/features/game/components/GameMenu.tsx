"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InstructionsModal } from "@/features/instructions";
import { cn } from "@/lib/utils";
import { HelpCircle, LogOut, MoreVertical, XCircle } from "lucide-react";
import { useState } from "react";

interface GameMenuProps {
  isHost: boolean;
  isPending: boolean;
  onEndGame: () => void;
  onLeaveGame: () => void;
}

/**
 * Game menu dropdown with options to end game (host) or leave game (all players)
 * Available at any point during the game
 */
export function GameMenu({
  isHost,
  isPending,
  onEndGame,
  onLeaveGame,
}: GameMenuProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            disabled={isPending}
          >
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">Game menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => setShowInstructions(true)}
            className="cursor-pointer"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            How to Play
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isHost && (
            <>
              <DropdownMenuItem
                onClick={onEndGame}
                disabled={isPending}
                className={cn(
                  "text-destructive focus:text-destructive",
                  "cursor-pointer"
                )}
              >
                <XCircle className="mr-2 h-4 w-4" />
                End Game
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={onLeaveGame}
            disabled={isPending}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Leave Game
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InstructionsModal
        open={showInstructions}
        onOpenChange={setShowInstructions}
      />
    </>
  );
}
