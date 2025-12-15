// Event payload types for game actions
// These define the shape of data sent to server actions

/**
 * Base event payload - all events include these fields
 */
export type BaseEvent = {
  /** The game ID this event is for */
  gameId: string;
  /** The player ID who triggered this event */
  actorId: string;
};

/**
 * JUDGE_PICKED - Host picks the judge for the round
 * - If judgeId is provided, that player becomes judge
 * - If not provided, first player in playerOrder becomes judge (or rotates)
 */
export type JudgePickedPayload = BaseEvent & {
  /** Optional: specific player to make judge. If omitted, uses rotation. */
  judgeId?: string;
};

/**
 * JUDGE_DEALS - Judge deals cards to all players
 * - Shuffles decks if empty
 * - Deals handSize cards to each player
 * - Reveals a prompt card
 */
export type JudgeDealsPayload = BaseEvent;

/**
 * ROUND_STARTS - Judge starts the answering phase
 * - Sets roundStartAt timestamp
 * - Players can now submit answers
 */
export type RoundStartsPayload = BaseEvent;

/**
 * PLAYER_ANSWERS - A player submits their reply card
 * - Validates the player owns the card
 * - Validates the player hasn't already submitted
 * - Validates the player is not the judge
 */
export type PlayerAnswersPayload = BaseEvent & {
  /** The card ID the player is submitting */
  cardId: string;
};

/**
 * ROUND_ENDS - Judge ends the answering phase
 * - No more submissions allowed
 * - Transition to judging phase
 */
export type RoundEndsPayload = BaseEvent;

/**
 * JUDGE_VOTES - Judge picks the winning submission
 * - Awards 1 point to the winning player
 * - Checks if game is over (player reached maxScore)
 * - Replenishes hands for players who submitted
 * - If winningPlayerId is null/undefined, skips round (no winner)
 */
export type JudgeVotesPayload = BaseEvent & {
  /** The player ID whose submission won. Null/undefined means no winner (skip round). */
  winningPlayerId?: string | null;
};

/**
 * Union type of all game event payloads
 */
export type GameEventPayload =
  | JudgePickedPayload
  | JudgeDealsPayload
  | RoundStartsPayload
  | PlayerAnswersPayload
  | RoundEndsPayload
  | JudgeVotesPayload;
