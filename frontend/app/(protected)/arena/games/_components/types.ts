import { Prisma, Rarity } from "@tillerquest/prisma/browser";

export type GameUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    arenaTokens: true;
    access: true;
    gold: true;
  };
}>;

export interface GameLeaderboardProps {
  user: {
    name: string | null;
    lastname: string | null;
    username: string | null;
    title: string | null;
    titleRarity: Rarity | null;
    image: string | null;
  };
  score: number;
  metadata: Record<string, unknown>;
}

export interface TypeQuestText {
  id: string;
  text: string;
}

export interface StartGameResponse {
  id: string;
  gameName: string;
}

export interface UpdateGameResponse<T = Record<string, unknown>> {
  score: number;
  metadata: T;
}

export interface FinishGameResponse {
  message: string;
  gold: number;
}

export interface BinaryJackInitialResponse {
  targetNumber: number;
  currentValue: number;
  turnsRemaining: number;
  stake: number;
}

export interface DiceRollResponse {
  rolledValue: number;
  diceRoll: string;
}

export type BinaryOperationResponse = {
  newValue: number;
  hitTarget: boolean;
  turnsRemaining: number;
};

export interface BinaryJackRoundResponse {
  availableDice: string[];
  availableOperations: string[];
}

export interface WordQuestBoardResponse {
  board: string[][];
  words: string[];
  foundWords: string[];
  score: number;
  hintPenalties: number;
}

export interface WordQuestHintResponse {
  score: number;
  index: number;
}
