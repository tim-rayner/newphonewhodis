"use client";

import { getPromptCard } from "@/features/game/assets/cards";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { GameWithState } from "@/shared/types/gameTypes";
import { AnimatePresence, motion } from "framer-motion";
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
import { GameCodeBadge } from "./mobile/GameCodeBadge";
import { JudgeBanner } from "./mobile/JudgeBanner";
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
  const previousPromptRef = useRef<string | null>(null);
  const [winnerRevealData, setWinnerRevealData] = useState<{
    name: string;
    cardId: string;
    promptText: string;
  } | null>(null);

  const { state } = game;
  const currentPlayer = playerId ? state.players[playerId] : null;
  const isHost = currentPlayer?.isHost ?? false;
  const isJudge = playerId === state.round.judgeId;

  const judgeName = state.round.judgeId
    ? state.players[state.round.judgeId]?.name || null
    : null;

  // Handle state updates from broadcast - also detect winner transitions
  const handleStateUpdate = useCallback((newState: GameSnapshotSchema) => {
    setGame((prev) => {
      const prevPhase = prev.state.phase;
      const newPhase = newState.phase;
      const prevPrompt = prev.state.round.promptCard;

      // Detect transition from JUDGING to LOBBY (round ended with winner)
      if (prevPhase === "JUDGING" && newPhase === "LOBBY") {
        const winnerId = newState.round.winningPlayerId;
        const winningCardId = winnerId
          ? prev.state.round.submissions[winnerId]
          : null;

        if (winnerId && newState.players[winnerId] && winningCardId) {
          const winnerPlayer = newState.players[winnerId];
          const promptCard = prevPrompt ? getPromptCard(prevPrompt) : null;

          // Schedule winner reveal after state update
          setTimeout(() => {
            setWinnerRevealData({
              name: winnerPlayer.name,
              cardId: winningCardId,
              promptText: promptCard?.value || "...",
            });
          }, 0);
        }
      }

      // Track prompt for winner reveal
      if (newState.round.promptCard) {
        previousPromptRef.current = newState.round.promptCard;
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

  // Ref to prevent duplicate auto-end calls
  const autoEndTriggeredRef = useRef(false);

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

  // Reset auto-end trigger when phase changes away from ANSWERING
  useEffect(() => {
    if (state.phase !== "ANSWERING") {
      autoEndTriggeredRef.current = false;
    }
  }, [state.phase]);

  // Auto-end round when timer expires (judge only)
  useEffect(() => {
    if (
      state.phase === "ANSWERING" &&
      isJudge &&
      timeRemaining === 0 &&
      !autoEndTriggeredRef.current &&
      !actions.isPending
    ) {
      autoEndTriggeredRef.current = true;
      actions.endRound();
    }
  }, [state.phase, isJudge, timeRemaining, actions]);

  // Auto-end round when all players have submitted (judge only)
  useEffect(() => {
    if (
      state.phase === "ANSWERING" &&
      isJudge &&
      !autoEndTriggeredRef.current &&
      !actions.isPending
    ) {
      const totalPlayers = Object.keys(state.players).length;
      const submissionCount = Object.keys(state.round.submissions).length;
      const expectedSubmissions = totalPlayers - 1; // exclude judge
      if (submissionCount >= expectedSubmissions && expectedSubmissions > 0) {
        autoEndTriggeredRef.current = true;
        actions.endRound();
      }
    }
  }, [state.phase, isJudge, state.players, state.round.submissions, actions]);

  // Show judge banner when not in lobby (already shown in lobby component)
  const showJudgeBanner =
    state.phase !== "LOBBY" && state.phase !== "FINISHED" && judgeName;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Winner Reveal Overlay */}
      {winnerRevealData && (
        <WinnerReveal
          winnerName={winnerRevealData.name}
          winningCardId={winnerRevealData.cardId}
          promptText={winnerRevealData.promptText}
          onComplete={() => setWinnerRevealData(null)}
        />
      )}

      {/* Top Bar - Mobile optimized */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b safe-area-top">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Game info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Title - hidden on mobile */}
              <h1 className="text-lg font-bold hidden md:block truncate">
                NPWD
              </h1>
              {/* Round indicator */}
              <span className="px-2 py-1 bg-secondary rounded-md text-xs font-medium whitespace-nowrap">
                R{state.round.roundNumber}
              </span>
              {/* Game code - compact on mobile, visible in header for quick sharing */}
              {state.phase !== "LOBBY" && (
                <GameCodeBadge gameCode={game.code} variant="compact" />
              )}
            </div>

            {/* Right: Timer, Connection, Players */}
            <div className="flex items-center gap-2">
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

        {/* Judge Banner - below header */}
        {showJudgeBanner && (
          <JudgeBanner judgeName={judgeName} isCurrentUserJudge={isJudge} />
        )}
      </header>

      {/* Main Content - Mobile optimized with safe areas */}
      <main className="container mx-auto px-4 py-6 max-w-lg pb-safe">
        <AnimatePresence mode="wait">
          {state.phase === "LOBBY" && (
            <motion.div key="lobby">
              <LobbyPhase
                state={state}
                gameCode={game.code}
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

        {/* Error display - mobile friendly */}
        {actions.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-4 right-4 mx-auto max-w-sm bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl shadow-lg z-30"
          >
            <p className="text-sm">{actions.error.message}</p>
            <button
              onClick={actions.clearError}
              className="mt-2 text-sm font-medium text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </main>

      {/* Debug: Raw state (collapsible) - hidden by default on mobile */}
      <details className="container mx-auto px-4 py-8 max-w-lg hidden md:block">
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
