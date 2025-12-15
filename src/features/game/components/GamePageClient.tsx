"use client";

import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { GameWithState } from "@/shared/types/gameTypes";
import { AnimatePresence, motion } from "framer-motion";
import { Crown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useGameActions, useGameChannel } from "../hooks";
import { ConnectionStatus } from "./ConnectionStatus";
import { CountdownTimer } from "./CountdownTimer";
import {
  AnsweringPhase,
  DealtPhase,
  FinishedPhase,
  JudgingPhase,
  LobbyPhase,
} from "./phases";
import { PlayerList } from "./PlayerList";
import { WinnerReveal } from "./WinnerReveal";

const ROUND_DURATION_SECONDS = 60;

function calculateTimeRemaining(roundStartAt: string | null): number | null {
  if (!roundStartAt) return null;
  const start = new Date(roundStartAt).getTime();
  const elapsed = Date.now() - start;
  return Math.max(0, ROUND_DURATION_SECONDS - Math.floor(elapsed / 1000));
}

export default function GamePageClient({
  initialGame,
}: {
  initialGame: GameWithState;
}) {
  const [game, setGame] = useState(initialGame);
  const playerId = usePlayerIdentity();
  const previousPhaseRef = useRef<string | null>(null);
  const previousWinnerIdRef = useRef<string | null>(null);
  const [winnerRevealData, setWinnerRevealData] = useState<{
    name: string;
    cardId: string;
  } | null>(null);

  const { state } = game;
  const currentPlayer = playerId ? state.players[playerId] : null;
  const isHost = currentPlayer?.isHost ?? false;
  const isJudge = playerId === state.round.judgeId;

  // Handle state updates from broadcast - also detect winner transitions
  const handleStateUpdate = useCallback((newState: GameSnapshotSchema) => {
    setGame((prev) => {
      const prevPhase = prev.state.phase;
      const newPhase = newState.phase;

      // Detect transition from JUDGING to LOBBY (round ended with winner)
      if (prevPhase === "JUDGING" && newPhase === "LOBBY") {
        const winnerId = newState.round.winningPlayerId;
        if (winnerId && newState.players[winnerId]) {
          const winnerPlayer = newState.players[winnerId];
          // Schedule winner reveal after state update
          setTimeout(() => {
            setWinnerRevealData({
              name: winnerPlayer.name,
              cardId: "winner",
            });
          }, 0);
        }
      }

      return { ...prev, state: newState };
    });
  }, []);

  // Subscribe to game channel for realtime updates
  const { connectionStatus, reconnect } = useGameChannel({
    gameId: initialGame.id,
    onStateUpdate: handleStateUpdate,
  });

  // Game actions with loading states
  const actions = useGameActions({
    gameId: game.id,
    playerId,
    onError: (error) => {
      console.error("Game action error:", error);
    },
  });

  // Convert players record to array for PlayerList
  const players = Object.entries(state.players).map(([id, player]) => ({
    id,
    name: player.name,
    avatar: player.avatar,
    score: player.score,
    isHost: player.isHost,
  }));

  // Track phase transitions for local state changes
  useEffect(() => {
    previousPhaseRef.current = state.phase;
    previousWinnerIdRef.current = state.round.winningPlayerId;
  });

  // Calculate time remaining using useSyncExternalStore for clean updates
  const timeSubscribe = useMemo(() => {
    return (callback: () => void) => {
      if (state.phase !== "ANSWERING" || !state.round.roundStartAt) {
        return () => {};
      }
      const interval = setInterval(callback, 1000);
      return () => clearInterval(interval);
    };
  }, [state.phase, state.round.roundStartAt]);

  const timeSnapshot = useMemo(() => {
    return () => {
      if (state.phase !== "ANSWERING") return null;
      return calculateTimeRemaining(state.round.roundStartAt);
    };
  }, [state.phase, state.round.roundStartAt]);

  const timeRemaining = useSyncExternalStore(
    timeSubscribe,
    timeSnapshot,
    timeSnapshot
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Winner Reveal Overlay */}
      {winnerRevealData && (
        <WinnerReveal
          winnerName={winnerRevealData.name}
          winningCardId={winnerRevealData.cardId}
          onComplete={() => setWinnerRevealData(null)}
        />
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Game Info */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold hidden sm:block">
                New Phone Who Dis?
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-secondary rounded-md font-medium">
                  Round {state.round.roundNumber}
                </span>
                {state.round.judgeId && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                    <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-amber-800 dark:text-amber-200 text-xs font-medium">
                      {state.players[state.round.judgeId]?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Timer, Connection, Players */}
            <div className="flex items-center gap-3">
              {state.phase === "ANSWERING" && (
                <CountdownTimer
                  startTime={state.round.roundStartAt}
                  durationSeconds={ROUND_DURATION_SECONDS}
                  size="sm"
                />
              )}
              <ConnectionStatus
                status={connectionStatus}
                onReconnect={reconnect}
              />
              <PlayerList players={players} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <AnimatePresence mode="wait">
          {state.phase === "LOBBY" && (
            <motion.div key="lobby">
              <LobbyPhase
                state={state}
                isHost={isHost}
                isJudge={isJudge}
                isPending={actions.isPending}
                onPickJudge={() => actions.pickJudge()}
                onDealCards={actions.dealCards}
              />
            </motion.div>
          )}

          {state.phase === "DEALT" && (
            <motion.div key="dealt">
              <DealtPhase
                state={state}
                isJudge={isJudge}
                isPending={actions.isPending}
                onStartRound={actions.startRound}
              />
            </motion.div>
          )}

          {state.phase === "ANSWERING" && (
            <motion.div key="answering">
              <AnsweringPhase
                state={state}
                playerId={playerId}
                isJudge={isJudge}
                isPending={actions.isPending}
                timeRemaining={timeRemaining}
                onSubmitCard={actions.submitCard}
                onEndRound={actions.endRound}
              />
            </motion.div>
          )}

          {state.phase === "JUDGING" && (
            <motion.div key="judging">
              <JudgingPhase
                state={state}
                isJudge={isJudge}
                isPending={actions.isPending}
                onVote={actions.vote}
              />
            </motion.div>
          )}

          {state.phase === "FINISHED" && (
            <motion.div key="finished">
              <FinishedPhase state={state} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error display */}
        {actions.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg shadow-lg"
          >
            {actions.error.message}
            <button
              onClick={actions.clearError}
              className="ml-2 text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </main>

      {/* Debug: Raw state (collapsible) */}
      <details className="container mx-auto px-4 py-8 max-w-4xl">
        <summary className="text-sm text-muted-foreground cursor-pointer">
          Debug: Raw State
        </summary>
        <pre className="mt-2 p-4 bg-secondary rounded-lg text-xs overflow-auto">
          {JSON.stringify({ gameId: game.id, playerId, state }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
