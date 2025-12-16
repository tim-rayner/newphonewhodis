"use client";

import {
  judgeDeals,
  judgePicked,
  judgeVotes,
  playerAnswers,
  restartGame,
  roundEnds,
  roundStarts,
} from "@/app/actions/game";
import { useCallback, useState, useTransition } from "react";

export type ActionError = {
  message: string;
  code?: string;
};

interface UseGameActionsOptions {
  gameId: string;
  playerId: string | null;
  onError?: (error: ActionError) => void;
}

interface UseGameActionsReturn {
  isPending: boolean;
  error: ActionError | null;
  clearError: () => void;
  pickJudge: (judgeId?: string) => Promise<void>;
  dealCards: () => Promise<void>;
  startRound: () => Promise<void>;
  submitCard: (cardId: string) => Promise<void>;
  endRound: () => Promise<void>;
  vote: (winningPlayerId?: string | null) => Promise<void>;
  restart: () => Promise<void>;
}

/**
 * Hook to wrap game server actions with loading states and error handling
 */
export function useGameActions({
  gameId,
  playerId,
  onError,
}: UseGameActionsOptions): UseGameActionsReturn {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<ActionError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleAction = useCallback(
    async (action: () => Promise<unknown>) => {
      if (!playerId) {
        const err = { message: "Player not identified", code: "NO_PLAYER" };
        setError(err);
        onError?.(err);
        return;
      }

      setError(null);

      return new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            await action();
            resolve();
          } catch (e) {
            const err: ActionError = {
              message: e instanceof Error ? e.message : "Action failed",
              code: "ACTION_ERROR",
            };
            setError(err);
            onError?.(err);
            resolve();
          }
        });
      });
    },
    [playerId, onError]
  );

  const pickJudge = useCallback(
    async (judgeId?: string) => {
      await handleAction(() =>
        judgePicked({ gameId, actorId: playerId!, judgeId })
      );
    },
    [gameId, playerId, handleAction]
  );

  const dealCards = useCallback(async () => {
    await handleAction(() => judgeDeals({ gameId, actorId: playerId! }));
  }, [gameId, playerId, handleAction]);

  const startRound = useCallback(async () => {
    await handleAction(() => roundStarts({ gameId, actorId: playerId! }));
  }, [gameId, playerId, handleAction]);

  const submitCard = useCallback(
    async (cardId: string) => {
      await handleAction(() =>
        playerAnswers({ gameId, actorId: playerId!, cardId })
      );
    },
    [gameId, playerId, handleAction]
  );

  const endRound = useCallback(async () => {
    await handleAction(() => roundEnds({ gameId, actorId: playerId! }));
  }, [gameId, playerId, handleAction]);

  const vote = useCallback(
    async (winningPlayerId?: string | null) => {
      await handleAction(() =>
        judgeVotes({ gameId, actorId: playerId!, winningPlayerId })
      );
    },
    [gameId, playerId, handleAction]
  );

  const restart = useCallback(async () => {
    await handleAction(() => restartGame({ gameId, actorId: playerId! }));
  }, [gameId, playerId, handleAction]);

  return {
    isPending,
    error,
    clearError,
    pickJudge,
    dealCards,
    startRound,
    submitCard,
    endRound,
    vote,
    restart,
  };
}
