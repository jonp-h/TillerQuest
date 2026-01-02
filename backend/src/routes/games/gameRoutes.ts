import express from "express";
import { initializeGame } from "./initializeGame.js";
import { startGame } from "data/games/game.js";
import { updateGame } from "./updateGame.js";
import { finishGame } from "./finishGame.js";

const router = express.Router();

router.post("/games", initializeGame);

router.post("/games/:gameId/start", startGame);

router.post("/games/:gameId", updateGame);

router.post("/games/:gameId/finish", finishGame);

export default router;
