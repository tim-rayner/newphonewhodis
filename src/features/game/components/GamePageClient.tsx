"use client";

import { trpc } from "@/external/trpc/client";
import { getPromptCard } from "@/features/game/assets/cards";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { usePlayerIdentity } from "@/features/player/hooks/usePlayerIdentity";
import { GameWithState } from "@/shared/types/gameTypes";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { GifCacheProvider } from "../context";
import { useGameActions, useGameChannel } from "../hooks";
import { GameNavbar } from "./GameNavbar";
import {
  AnsweringPhase,
  DealtPhase,
  FinishedPhase,
  JudgingPhase,
  LobbyPhase,
} from "./phases";
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
  const router = useRouter();
  const [game, setGame] = useState(initialGame);
  const playerId = usePlayerIdentity();
  const previousPhaseRef = useRef<string | null>(null);
  const previousWinnerIdRef = useRef<string | null>(null);
  const previousPromptRef = useRef<string | null>(null);
  const [winnerRevealData, setWinnerRevealData] = useState<{
    name: string;
    cardId: string;
    promptCardId: string;
    promptText: string;
    judgeName: string;
    wildcardTexts: Record<string, string>;
  } | null>(null);

  const { state } = game;
  const currentPlayer = playerId ? state.players[playerId] : null;
  const isHost = currentPlayer?.isHost ?? false;
  const isJudge = playerId === state.round.judgeId;

  const judgeName = state.round.judgeId
    ? state.players[state.round.judgeId]?.name || null
    : null;

  // Handle game ended event from broadcast - redirect to home
  const handleGameEnded = useCallback(() => {
    router.push("/");
  }, [router]);

  // Handle state updates from broadcast - also detect winner transitions
  const handleStateUpdate = useCallback((newState: GameSnapshotSchema) => {
    setGame((prev) => {
      const prevPhase = prev.state.phase;
      const prevPrompt = prev.state.round.promptCard;

      // Detect winner when transitioning from JUDGING phase
      // This handles both JUDGING -> ANSWERING (next round) and JUDGING -> FINISHED (game over)
      // We check for winningPlayerId to determine if there was a winner this round
      const winnerId = newState.round.winningPlayerId;
      const wasJudging = prevPhase === "JUDGING";
      const hasWinner = winnerId && newState.players[winnerId];

      if (wasJudging && hasWinner) {
        // Get the winning card from the PREVIOUS state's submissions (before they were cleared)
        const winningCardId = prev.state.round.submissions[winnerId];

        // Capture the judge name from the previous state (before round reset)
        const prevJudgeId = prev.state.round.judgeId;
        const prevJudgeName = prevJudgeId
          ? prev.state.players[prevJudgeId]?.name || "Judge"
          : "Judge";

        if (winningCardId) {
          const winnerPlayer = newState.players[winnerId];
          const promptCard = prevPrompt ? getPromptCard(prevPrompt) : null;
          // Capture wildcardTexts from current state (before it changes)
          const capturedWildcardTexts = prev.state.wildcardTexts || {};

          // Schedule winner reveal after state update
          setTimeout(() => {
            setWinnerRevealData({
              name: winnerPlayer.name,
              cardId: winningCardId,
              promptCardId: prevPrompt || "",
              promptText: promptCard?.value || "...",
              judgeName: prevJudgeName,
              wildcardTexts: capturedWildcardTexts,
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

  // tRPC utils for fetching game state on reconnection
  const trpcUtils = trpc.useUtils();

  // Sync state from database - called after reconnection to catch missed broadcasts
  const handleSyncState = useCallback(async () => {
    try {
      const freshGame = await trpcUtils.game.getGame.fetch({
        gameId: initialGame.id,
      });
      if (freshGame?.state) {
        // Apply the fetched state (don't trigger winner reveal on sync)
        setGame((prev) => ({ ...prev, state: freshGame.state }));
      }
    } catch (error) {
      console.error("Failed to sync game state:", error);
    }
  }, [initialGame.id, trpcUtils.game.getGame]);

  // Subscribe to game channel for realtime updates
  const { connectionStatus, reconnect } = useGameChannel({
    gameId: initialGame.id,
    onStateUpdate: handleStateUpdate,
    onGameEnded: handleGameEnded,
    onSyncState: handleSyncState,
  });

  // Game actions with loading states
  const actions = useGameActions({
    gameId: game.id,
    playerId,
    onError: (error) => {
      console.error("Game action error:", error);
    },
  });

  // Menu action handlers that redirect after success
  const handleEndGame = useCallback(async () => {
    await actions.endGame();
    // The broadcast will handle redirect for all players
    // But we also redirect the host immediately
    router.push("/");
  }, [actions, router]);

  const handleLeaveGame = useCallback(async () => {
    await actions.leaveGame();
    // Redirect the leaving player home
    router.push("/");
  }, [actions, router]);

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

  // Get host info from the game
  const host = state.players[initialGame.hostId];
  const hostName = host?.name ?? "Unknown";
  const hostAvatar = host?.avatar ?? null;

  return (
    <GifCacheProvider serverGifUrls={state.gifUrls}>
      <div className="relative min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Winner Reveal Overlay */}
        {winnerRevealData && (
          <WinnerReveal
            winnerName={winnerRevealData.name}
            winningCardId={winnerRevealData.cardId}
            promptCardId={winnerRevealData.promptCardId}
            promptText={winnerRevealData.promptText}
            judgeName={winnerRevealData.judgeName}
            wildcardTexts={winnerRevealData.wildcardTexts}
            onComplete={() => setWinnerRevealData(null)}
          />
        )}

        {/* Unified Game Navbar */}
        <GameNavbar
          roundNumber={state.round.roundNumber}
          phase={state.phase}
          roundStartAt={state.round.roundStartAt}
          gameCode={game.code}
          players={players}
          hostName={hostName}
          hostAvatar={hostAvatar}
          connectionStatus={connectionStatus}
          onReconnect={reconnect}
          judgeName={judgeName}
          isCurrentUserJudge={isJudge}
          isHost={isHost}
          isPending={actions.isPending}
          onEndGame={handleEndGame}
          onLeaveGame={handleLeaveGame}
        />

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
                <FinishedPhase
                  state={state}
                  isHost={isHost}
                  isPending={actions.isPending}
                  onPlayAgain={actions.restart}
                />
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
      </div>
    </GifCacheProvider>
  );
}
