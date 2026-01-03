import express from "express";
import { initializeGame } from "./initializeGame.js";
import { startGame } from "./startGame.js";
import { updateGame } from "./updateGame.js";
import { finishGame } from "./finishGame.js";
import { getGameLeaderboard } from "./getGameLeaderboard.js";
import { getTypeQuestText } from "./getTypeQuestText.js";
import { getWordQuestBoard } from "./getWordQuestBoard.js";
import { getWordQuestHint } from "./getWordQuestHint.js";
import { initializeBinaryJack } from "./initializeBinaryJack.js";
import { startBinaryJackRound } from "./startBinaryJackRound.js";
import { rollBinaryJackDice } from "./rollBinaryJackDice.js";
import { applyBinaryOperation } from "./applyBinaryOperation.js";

const router = express.Router();

// General game routes
router.post("/games", initializeGame);
router.post("/games/:gameId/start", startGame);
router.patch("/games/:gameId", updateGame);
router.post("/games/:gameId/finish", finishGame);
router.get("/games/leaderboard/:gameName", getGameLeaderboard);

// TypeQuest routes
router.get("/games/typequest/text", getTypeQuestText);

// WordQuest routes
router.get("/games/wordquest/boards/:gameId", getWordQuestBoard);
router.post("/games/wordquest/boards/:gameId/hints", getWordQuestHint);

// BinaryJack routes
router.post("/games/:gameId/binaryjack/initialize", initializeBinaryJack);
router.post("/games/:gameId/binaryjack/rounds", startBinaryJackRound);
router.post("/games/:gameId/binaryjack/roll", rollBinaryJackDice);
router.post("/games/:gameId/binaryjack/operate", applyBinaryOperation);

export default router;
