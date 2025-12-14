"use client";

import {
  judgeDeals,
  judgePicked,
  judgeVotes,
  playerAnswers,
  roundEnds,
  roundStarts,
} from "@/app/actions/game";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/external/supabase/client";
import { getPromptCard, getReplyCard } from "@/features/game/assets/cards";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { GameWithState } from "@/shared/types/gameTypes";
import { useEffect, useState, useTransition } from "react";
import { PlayerList } from "./PlayerList";

export default function GamePageClient({
  initialGame,
}: {
  initialGame: GameWithState;
}) {
  const [game, setGame] = useState(initialGame);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const playerId = usePlayerIdentity();

  const { state } = game;
  const currentPlayer = playerId ? state.players[playerId] : null;
  const isHost = currentPlayer?.isHost ?? false;
  const isJudge = playerId === state.round.judgeId;

  // Convert players record to array for PlayerList
  const players = Object.entries(state.players).map(([id, player]) => ({
    id,
    name: player.name,
    avatar: player.avatar,
    score: player.score,
    isHost: player.isHost,
  }));

  // Get prompt card text
  const promptCard = state.round.promptCard
    ? getPromptCard(state.round.promptCard)
    : null;

  // Client Component Subscribes to Realtime
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

  // Action handlers
  const handlePickJudge = () => {
    if (!playerId) return;
    startTransition(async () => {
      await judgePicked({ gameId: game.id, actorId: playerId });
    });
  };

  const handleDealCards = () => {
    if (!playerId) return;
    startTransition(async () => {
      await judgeDeals({ gameId: game.id, actorId: playerId });
    });
  };

  const handleStartRound = () => {
    if (!playerId) return;
    startTransition(async () => {
      await roundStarts({ gameId: game.id, actorId: playerId });
    });
  };

  const handleSubmitCard = (cardId: string) => {
    if (!playerId) return;
    startTransition(async () => {
      await playerAnswers({ gameId: game.id, actorId: playerId, cardId });
    });
  };

  const handleEndRound = () => {
    if (!playerId) return;
    startTransition(async () => {
      await roundEnds({ gameId: game.id, actorId: playerId });
    });
  };

  const handleVote = (winningPlayerId: string) => {
    if (!playerId) return;
    startTransition(async () => {
      await judgeVotes({ gameId: game.id, actorId: playerId, winningPlayerId });
    });
  };

  // Calculate countdown timer
  const getTimeRemaining = () => {
    if (!state.round.roundStartAt) return null;
    const startTime = new Date(state.round.roundStartAt).getTime();
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
    return remaining;
  };

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (state.phase !== "ANSWERING") {
      setTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    setTimeRemaining(getTimeRemaining());

    return () => clearInterval(interval);
  }, [state.phase, state.round.roundStartAt]);

  return (
    <div className="relative min-h-screen p-4">
      {/* Player List - positioned top right */}
      <div className="absolute top-4 right-4 z-10">
        <PlayerList players={players} />
      </div>

      {/* Game Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Phone Who Dis?</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>Round {state.round.roundNumber}</span>
          <span className="px-2 py-1 bg-secondary rounded-md font-medium">
            {state.phase}
          </span>
          {state.round.judgeId && (
            <span>
              Judge: {state.players[state.round.judgeId]?.name ?? "Unknown"}
            </span>
          )}
          {timeRemaining !== null && (
            <span className="text-orange-500 font-bold">
              Time: {timeRemaining}s
            </span>
          )}
        </div>
      </div>

      {/* Prompt Card */}
      {promptCard && (
        <Card className="mb-6 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{promptCard.value}</p>
          </CardContent>
        </Card>
      )}

      {/* Phase-specific UI */}
      <div className="space-y-6">
        {/* LOBBY Phase */}
        {state.phase === "LOBBY" && (
          <Card>
            <CardHeader>
              <CardTitle>Lobby</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {state.round.judgeId
                  ? `${
                      state.players[state.round.judgeId]?.name
                    } is the judge. Waiting for them to deal cards...`
                  : "Waiting for host to pick a judge..."}
              </p>

              {/* Host controls */}
              {isHost && !state.round.judgeId && (
                <Button onClick={handlePickJudge} disabled={isPending}>
                  Pick Judge
                </Button>
              )}

              {/* Judge controls */}
              {isJudge && state.round.judgeId && (
                <Button onClick={handleDealCards} disabled={isPending}>
                  Deal Cards
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* DEALT Phase */}
        {state.phase === "DEALT" && (
          <Card>
            <CardHeader>
              <CardTitle>Cards Dealt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {isJudge
                  ? "You are the judge. Start the round when ready!"
                  : "Waiting for judge to start the round..."}
              </p>

              {isJudge && (
                <Button onClick={handleStartRound} disabled={isPending}>
                  Start Round
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* ANSWERING Phase */}
        {state.phase === "ANSWERING" && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isJudge ? "Players are answering..." : "Choose your reply!"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isJudge ? (
                <>
                  <p className="text-muted-foreground">
                    {Object.keys(state.round.submissions).length} /{" "}
                    {Object.keys(state.players).length - 1} players have
                    submitted
                  </p>
                  <Button onClick={handleEndRound} disabled={isPending}>
                    End Answering Phase
                  </Button>
                </>
              ) : currentPlayer?.submittedCard ? (
                <p className="text-muted-foreground">
                  You submitted your answer. Waiting for others...
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Select a card from your hand below to submit.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* JUDGING Phase */}
        {state.phase === "JUDGING" && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isJudge ? "Pick the winner!" : "Judge is deciding..."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {Object.entries(state.round.submissions).map(
                  ([submitterId, cardId]) => {
                    const replyCard = getReplyCard(cardId);
                    return (
                      <div
                        key={submitterId}
                        className="p-4 border rounded-lg flex items-center justify-between"
                      >
                        <p className="flex-1">{replyCard?.value || cardId}</p>
                        {isJudge && (
                          <Button
                            size="sm"
                            onClick={() => handleVote(submitterId)}
                            disabled={isPending}
                          >
                            Pick Winner
                          </Button>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ROUND_END Phase (brief transition) */}
        {state.phase === "ROUND_END" && (
          <Card>
            <CardHeader>
              <CardTitle>Round Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              {state.round.winningPlayerId && (
                <p className="text-lg">
                  Winner:{" "}
                  {state.players[state.round.winningPlayerId]?.name ??
                    "Unknown"}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* FINISHED Phase */}
        {state.phase === "FINISHED" && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Game Over!</CardTitle>
            </CardHeader>
            <CardContent>
              {state.round.winningPlayerId && (
                <p className="text-xl font-bold">
                  {state.players[state.round.winningPlayerId]?.name} wins with{" "}
                  {state.players[state.round.winningPlayerId]?.score} points!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Player's Hand */}
        {currentPlayer && currentPlayer.hand.length > 0 && !isJudge && (
          <Card>
            <CardHeader>
              <CardTitle>Your Hand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {currentPlayer.hand.map((cardId) => {
                  const replyCard = getReplyCard(cardId);
                  const canSubmit =
                    state.phase === "ANSWERING" && !currentPlayer.submittedCard;
                  return (
                    <button
                      key={cardId}
                      onClick={() => canSubmit && handleSubmitCard(cardId)}
                      disabled={!canSubmit || isPending}
                      className={`p-4 text-left border rounded-lg transition-colors ${
                        canSubmit
                          ? "hover:bg-accent hover:border-primary cursor-pointer"
                          : "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      {replyCard?.value || cardId}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Debug: Raw state (collapsible) */}
      <details className="mt-8">
        <summary className="text-sm text-muted-foreground cursor-pointer">
          Debug: Raw State
        </summary>
        <pre className="mt-2 p-4 bg-secondary rounded-lg text-xs overflow-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      </details>
    </div>
  );
}
