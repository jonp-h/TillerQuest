import express from "express";
import { getQuests } from "./getQuests.js";

const router = express.Router();

router.get("/quests", getQuests);

export default router;
