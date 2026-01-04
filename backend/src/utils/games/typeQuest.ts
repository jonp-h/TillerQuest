import { Game } from "lib/db.js";
import { ErrorMessage } from "lib/error.js";
import { logger } from "lib/logger.js";
import { PrismaTransaction } from "types/prismaTransaction.js";

export const updateTypeQuestGame = async (
  db: PrismaTransaction,
  userId: string,
  score: number,
  metadata: Record<string, any>,
  game: Game,
  charIndex: number,
  mistakes: number,
) => {
  const maxTime = 60;
  const timeElapsed =
    (new Date().getTime() - new Date(game.startedAt).getTime()) / 1000;
  const time = maxTime - timeElapsed;
  const correctChars = charIndex - mistakes;
  const totalTime = maxTime - time;

  // words per minute. Mathmatical standard is 5 characters per word
  let wpm = Math.round((correctChars / 5 / totalTime) * 60);
  wpm = wpm < 0 || !wpm || wpm == Infinity ? 0 : Math.floor(wpm);

  // characters per minute
  let cpm = correctChars * (60 / totalTime);
  cpm = cpm < 0 || !cpm || cpm == Infinity ? 0 : Math.floor(cpm);

  // unrealistic values cancel the game
  // TODO: consider checking for unrealistic mistakes to invalidate game
  if (charIndex > 800 || wpm > 135) {
    await db.game.delete({
      where: { id: game.id, status: "INPROGRESS" },
    });
    logger.warn(
      "Invalid game state, game aborted for user: " +
        userId +
        ". Game data (Charindex and wpm): " +
        charIndex +
        wpm,
    );
    throw new ErrorMessage("Invalid game state, game aborted");
  }

  const mistakePenalty = 1 - mistakes / (charIndex + 1);
  score = Math.floor(cpm * 2 * mistakePenalty);
  const totalCharacters = charIndex;

  metadata = {
    wpm,
    cpm,
    totalCharacters,
    mistakes,
  };
  return { score, metadata };
};
