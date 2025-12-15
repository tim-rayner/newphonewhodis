// Pure event handlers for game state transitions
// Each handler: (snapshot, payload) => newSnapshot
// All validation and game rules live here - never trust the client

import type {
  JudgeDealsPayload,
  JudgePickedPayload,
  JudgeVotesPayload,
  PlayerAnswersPayload,
  RoundEndsPayload,
  RoundStartsPayload,
} from "@/features/game/types/events";
import type { GameSnapshotSchema } from "@/features/game/types/schema";

// ============================================================================
// Error classes for validation failures
// ============================================================================

export class GameError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "GameError";
  }
}

export class InvalidPhaseError extends GameError {
  constructor(expected: string, actual: string) {
    super(
      `Invalid phase: expected ${expected}, got ${actual}`,
      "INVALID_PHASE"
    );
  }
}

export class UnauthorizedError extends GameError {
  constructor(message: string) {
    super(message, "UNAUTHORIZED");
  }
}

export class InvalidActionError extends GameError {
  constructor(message: string) {
    super(message, "INVALID_ACTION");
  }
}

// ============================================================================
// Helper functions
// ============================================================================

function getHostId(snapshot: GameSnapshotSchema): string | null {
  for (const [playerId, player] of Object.entries(snapshot.players)) {
    if (player.isHost) return playerId;
  }
  return null;
}

function getNextJudgeId(snapshot: GameSnapshotSchema): string {
  const { playerOrder, round } = snapshot;
  if (playerOrder.length === 0) {
    throw new InvalidActionError("No players in game");
  }

  // If no current judge, return first player
  if (!round.judgeId) {
    return playerOrder[0];
  }

  // Find current judge index and rotate
  const currentIndex = playerOrder.indexOf(round.judgeId);
  if (currentIndex === -1) {
    return playerOrder[0];
  }

  const nextIndex = (currentIndex + 1) % playerOrder.length;
  return playerOrder[nextIndex];
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * handleJudgePicked - Host picks (or rotates to) the judge
 *
 * Validates:
 * - Phase is LOBBY
 * - Actor is the host
 * - judgeId (if provided) is a valid player
 *
 * Transitions: LOBBY -> LOBBY (judge is set but game hasn't started)
 */
export function handleJudgePicked(
  snapshot: GameSnapshotSchema,
  payload: JudgePickedPayload
): GameSnapshotSchema {
  // Validate phase
  if (snapshot.phase !== "LOBBY") {
    throw new InvalidPhaseError("LOBBY", snapshot.phase);
  }

  // Validate actor is host
  const hostId = getHostId(snapshot);
  if (payload.actorId !== hostId) {
    throw new UnauthorizedError("Only the host can pick the judge");
  }

  // Determine judge - use provided or rotate
  const judgeId = payload.judgeId ?? getNextJudgeId(snapshot);

  // Validate judge is a player
  if (!snapshot.players[judgeId]) {
    throw new InvalidActionError(`Player ${judgeId} is not in the game`);
  }

  // Return new snapshot with judge set
  return {
    ...snapshot,
    round: {
      ...snapshot.round,
      judgeId,
    },
  };
}

/**
 * handleJudgeDeals - Judge deals cards to all players and reveals prompt
 *
 * Validates:
 * - Phase is LOBBY
 * - Actor is the judge
 * - Enough cards in deck to deal
 *
 * Transitions: LOBBY -> DEALT
 */
export function handleJudgeDeals(
  snapshot: GameSnapshotSchema,
  payload: JudgeDealsPayload
): GameSnapshotSchema {
  // Validate phase
  if (snapshot.phase !== "LOBBY") {
    throw new InvalidPhaseError("LOBBY", snapshot.phase);
  }

  // Validate judge exists
  if (!snapshot.round.judgeId) {
    throw new InvalidActionError("No judge has been picked yet");
  }

  // Validate actor is judge
  if (payload.actorId !== snapshot.round.judgeId) {
    throw new UnauthorizedError("Only the judge can deal cards");
  }

  const { handSize } = snapshot.settings;
  const playerIds = Object.keys(snapshot.players);

  // Copy decks (pre-populated at game creation)
  const promptDeck = [...snapshot.decks.prompts];
  const responseDeck = [...snapshot.decks.responses];

  // Only deal fresh hands on the first round
  const isFirstRound = snapshot.round.roundNumber === 0;
  const newPlayers = { ...snapshot.players };

  if (isFirstRound) {
    // Calculate how many cards we need
    const cardsNeeded = playerIds.length * handSize;
    if (responseDeck.length < cardsNeeded) {
      throw new InvalidActionError(
        `Not enough response cards in deck. Need ${cardsNeeded}, have ${responseDeck.length}`
      );
    }

    // Deal cards to each player
    for (const playerId of playerIds) {
      const player = snapshot.players[playerId];
      const hand = responseDeck.splice(0, handSize);
      newPlayers[playerId] = {
        ...player,
        hand,
        submittedCard: null,
      };
    }
  } else {
    // Subsequent rounds: just reset submittedCard, keep existing hands
    for (const playerId of playerIds) {
      const player = snapshot.players[playerId];
      newPlayers[playerId] = {
        ...player,
        submittedCard: null,
      };
    }
  }

  // Draw prompt card
  if (promptDeck.length === 0) {
    throw new InvalidActionError("No prompt cards available");
  }
  const promptCard = promptDeck.shift()!;

  return {
    ...snapshot,
    players: newPlayers,
    decks: {
      prompts: promptDeck,
      responses: responseDeck,
    },
    round: {
      ...snapshot.round,
      roundNumber: snapshot.round.roundNumber + 1,
      promptCard,
      submissions: {},
      winningPlayerId: null,
      roundStartAt: null,
    },
    phase: "DEALT",
  };
}

/**
 * handleRoundStarts - Judge starts the answering phase
 *
 * Validates:
 * - Phase is DEALT
 * - Actor is the judge
 *
 * Transitions: DEALT -> ANSWERING
 */
export function handleRoundStarts(
  snapshot: GameSnapshotSchema,
  payload: RoundStartsPayload
): GameSnapshotSchema {
  // Validate phase
  if (snapshot.phase !== "DEALT") {
    throw new InvalidPhaseError("DEALT", snapshot.phase);
  }

  // Validate actor is judge
  if (payload.actorId !== snapshot.round.judgeId) {
    throw new UnauthorizedError("Only the judge can start the round");
  }

  return {
    ...snapshot,
    round: {
      ...snapshot.round,
      roundStartAt: new Date().toISOString(),
    },
    phase: "ANSWERING",
  };
}

/**
 * handlePlayerAnswers - A player submits their reply card
 *
 * Validates:
 * - Phase is ANSWERING
 * - Actor is not the judge
 * - Actor owns the card
 * - Actor hasn't already submitted
 *
 * Transitions: ANSWERING -> ANSWERING (no phase change)
 */
export function handlePlayerAnswers(
  snapshot: GameSnapshotSchema,
  payload: PlayerAnswersPayload
): GameSnapshotSchema {
  // Validate phase
  if (snapshot.phase !== "ANSWERING") {
    throw new InvalidPhaseError("ANSWERING", snapshot.phase);
  }

  // Validate actor exists
  const player = snapshot.players[payload.actorId];
  if (!player) {
    throw new InvalidActionError("Player not in this game");
  }

  // Validate actor is not the judge
  if (payload.actorId === snapshot.round.judgeId) {
    throw new UnauthorizedError("The judge cannot submit an answer");
  }

  // Validate player hasn't already submitted
  if (snapshot.round.submissions[payload.actorId]) {
    throw new InvalidActionError(
      "Player has already submitted a reply this round"
    );
  }

  // Validate player owns the card
  if (!player.hand.includes(payload.cardId)) {
    throw new InvalidActionError(
      "Player does not have this card in their hand"
    );
  }

  // Remove card from hand and add to submissions
  const newHand = player.hand.filter((id) => id !== payload.cardId);

  return {
    ...snapshot,
    players: {
      ...snapshot.players,
      [payload.actorId]: {
        ...player,
        hand: newHand,
        submittedCard: payload.cardId,
      },
    },
    round: {
      ...snapshot.round,
      submissions: {
        ...snapshot.round.submissions,
        [payload.actorId]: payload.cardId,
      },
    },
  };
}

/**
 * handleRoundEnds - Judge ends the answering phase
 *
 * Validates:
 * - Phase is ANSWERING
 * - Actor is the judge
 *
 * Transitions: ANSWERING -> JUDGING
 */
export function handleRoundEnds(
  snapshot: GameSnapshotSchema,
  payload: RoundEndsPayload
): GameSnapshotSchema {
  // Validate phase
  if (snapshot.phase !== "ANSWERING") {
    throw new InvalidPhaseError("ANSWERING", snapshot.phase);
  }

  // Validate actor is judge
  if (payload.actorId !== snapshot.round.judgeId) {
    throw new UnauthorizedError("Only the judge can end the round");
  }

  return {
    ...snapshot,
    phase: "JUDGING",
  };
}

/**
 * handleJudgeVotes - Judge picks the winning submission
 *
 * Validates:
 * - Phase is JUDGING
 * - Actor is the judge
 * - winningPlayerId submitted a card (if provided)
 *
 * Transitions:
 * - JUDGING -> LOBBY (if no winner yet, next round)
 * - JUDGING -> FINISHED (if player reached maxScore)
 *
 * If winningPlayerId is null/undefined, skips the round (no winner)
 */
export function handleJudgeVotes(
  snapshot: GameSnapshotSchema,
  payload: JudgeVotesPayload
): GameSnapshotSchema {
  // Validate phase
  if (snapshot.phase !== "JUDGING") {
    throw new InvalidPhaseError("JUDGING", snapshot.phase);
  }

  // Validate actor is judge
  if (payload.actorId !== snapshot.round.judgeId) {
    throw new UnauthorizedError("Only the judge can vote");
  }

  const hasWinner = payload.winningPlayerId != null;
  let newScore = 0;

  // If there's a winner, validate they submitted a card
  if (hasWinner) {
    const winningSubmission =
      snapshot.round.submissions[payload.winningPlayerId!];
    if (!winningSubmission) {
      throw new InvalidActionError(
        "Selected player did not submit a card this round"
      );
    }
    // Award point to winner
    const winningPlayer = snapshot.players[payload.winningPlayerId!];
    newScore = winningPlayer.score + 1;
  }

  // Replenish hands for players who submitted (draw 1 card each)
  const newPlayers = { ...snapshot.players };
  const responseDeck = [...snapshot.decks.responses];

  for (const [playerId] of Object.entries(snapshot.round.submissions)) {
    const player = snapshot.players[playerId];
    // Give player a new card if deck has cards
    if (responseDeck.length > 0) {
      const newCard = responseDeck.shift()!;
      newPlayers[playerId] = {
        ...player,
        hand: [...player.hand, newCard],
        submittedCard: null, // Reset submitted card
        score:
          hasWinner && playerId === payload.winningPlayerId
            ? newScore
            : player.score,
      };
    } else {
      newPlayers[playerId] = {
        ...player,
        submittedCard: null,
        score:
          hasWinner && playerId === payload.winningPlayerId
            ? newScore
            : player.score,
      };
    }
  }

  // Also reset submittedCard for judge (who didn't submit)
  if (snapshot.round.judgeId && newPlayers[snapshot.round.judgeId]) {
    newPlayers[snapshot.round.judgeId] = {
      ...newPlayers[snapshot.round.judgeId],
      submittedCard: null,
    };
  }

  // Check if game is over (only if there's a winner)
  const gameOver = hasWinner && newScore >= snapshot.settings.maxScore;

  // Rotate judge for next round
  const nextJudgeId = getNextJudgeId(snapshot);

  return {
    ...snapshot,
    players: newPlayers,
    decks: {
      ...snapshot.decks,
      responses: responseDeck,
    },
    round: {
      ...snapshot.round,
      winningPlayerId: payload.winningPlayerId ?? null,
      judgeId: gameOver ? snapshot.round.judgeId : nextJudgeId,
      // Reset for next round if game continues
      promptCard: gameOver ? snapshot.round.promptCard : null,
      submissions: gameOver ? snapshot.round.submissions : {},
      roundStartAt: null,
    },
    phase: gameOver ? "FINISHED" : "LOBBY",
  };
}
