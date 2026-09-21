import { Game } from "@tillerquest/prisma/browser";
import { ErrorMessage, GameAbortedError } from "../../lib/error.js";
import { logger } from "../../lib/logger.js";
import { PrismaTransaction } from "../../types/prismaTransaction.js";

const MAX_TOTAL_CHARS = 800;
const MAX_CHARS_PER_SECOND = 11.5; // ~135 WPM at 5 chars/word
const MAX_WPM = 135;
const MIN_UPDATE_INTERVAL_MS = 100;
const MAX_ERROR_RATE = 0.5;
const SPEED_HISTORY_SIZE = 20;
// interval speeds with a coefficient of variation below this (with enough samples)
// are unnaturally constant, i.e. likely a bot rather than a human typist
const CONSTANT_SPEED_CV_THRESHOLD = 0.05;
const MIN_SAMPLES_FOR_CONSTANT_CHECK = 10;

export const updateTypeQuestGame = async (
  db: PrismaTransaction,
  userId: string,
  score: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>,
  game: Game,
  charIndex: number,
  mistakes: number,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let metadataObj: any = game.metadata;
  if (typeof metadataObj === "string") {
    try {
      metadataObj = JSON.parse(metadataObj);
    } catch {
      metadataObj = {};
    }
  }
  metadataObj = metadataObj ?? {};

  const now = new Date().getTime();
  const startedAt = new Date(game.startedAt).getTime();
  const lastCharIndex: number = metadataObj.lastCharIndex ?? 0;
  const lastUpdateAt: number = metadataObj.lastUpdateAt ?? startedAt;
  const speedHistory: number[] = metadataObj.speedHistory ?? [];

  // hard cap on total characters, regardless of anything else
  if (charIndex > MAX_TOTAL_CHARS) {
    throw new ErrorMessage("Character index exceeds maximum allowed (800)");
  }

  // charIndex must never go backwards
  if (charIndex < lastCharIndex) {
    throw new ErrorMessage("Character index cannot decrease");
  }

  // throttle: reject updates that arrive faster than a human can plausibly send them
  const msSinceLastUpdate = now - lastUpdateAt;
  if (msSinceLastUpdate < MIN_UPDATE_INTERVAL_MS) {
    throw new ErrorMessage("Update rate too fast");
  }

  // error rate must be realistic
  const errorRate = charIndex > 0 ? mistakes / charIndex : 0;
  if (errorRate < 0 || errorRate > MAX_ERROR_RATE) {
    throw new ErrorMessage("Unrealistic error rate detected");
  }

  // progression since the last update must not exceed a physically plausible typing speed
  const charDiff = charIndex - lastCharIndex;
  const elapsedSeconds = msSinceLastUpdate / 1000;
  const maxAllowedChars = Math.ceil(elapsedSeconds * MAX_CHARS_PER_SECOND);
  if (charDiff > maxAllowedChars) {
    throw new ErrorMessage(
      "Character progression too fast (potential cheating detected)",
    );
  }

  // track recent typing speed samples to spot unnaturally constant (bot-like) input
  const currentSpeed = charDiff / elapsedSeconds;
  const updatedSpeedHistory = [...speedHistory, currentSpeed].slice(
    -SPEED_HISTORY_SIZE,
  );
  if (updatedSpeedHistory.length >= MIN_SAMPLES_FOR_CONSTANT_CHECK) {
    const mean =
      updatedSpeedHistory.reduce((sum, v) => sum + v, 0) /
      updatedSpeedHistory.length;
    const variance =
      updatedSpeedHistory.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
      updatedSpeedHistory.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
    if (coefficientOfVariation < CONSTANT_SPEED_CV_THRESHOLD) {
      logger.warn(
        "Unnaturally constant typing speed detected for user: " +
          userId +
          " (coefficient of variation: " +
          coefficientOfVariation.toFixed(4) +
          ")",
      );
    }
  }

  const maxTime = 60;
  const timeElapsed = (now - startedAt) / 1000;
  const time = maxTime - timeElapsed;
  const correctChars = charIndex - mistakes;
  const totalTime = maxTime - time;

  // words per minute. Mathmatical standard is 5 characters per word
  let wpm = Math.round((correctChars / 5 / totalTime) * 60);
  wpm = wpm < 0 || !wpm || wpm == Infinity ? 0 : Math.floor(wpm);

  // characters per minute
  let cpm = correctChars * (60 / totalTime);
  cpm = cpm < 0 || !cpm || cpm == Infinity ? 0 : Math.floor(cpm);

  // final sanity check: actual WPM over the full game duration must stay under the cap.
  // thrown as GameAbortedError so the caller can persist the abort (score 0) after this
  // transaction rolls back, instead of relying on a db write inside the doomed transaction
  if (wpm > MAX_WPM) {
    logger.warn(
      "Invalid game state, game aborted for user: " +
        userId +
        ". Game data (Charindex and wpm): " +
        charIndex +
        wpm,
    );
    throw new GameAbortedError("Invalid game state, game aborted", game.id);
  }

  const mistakePenalty = 1 - mistakes / (charIndex + 1);
  score = Math.floor(cpm * 2 * mistakePenalty);
  const totalCharacters = charIndex;

  metadata = {
    wpm,
    cpm,
    totalCharacters,
    mistakes,
    lastCharIndex: charIndex,
    lastUpdateAt: now,
    speedHistory: updatedSpeedHistory,
  };
  return { score, metadata };
};
