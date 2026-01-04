import express from "express";
import { getLastMana } from "./lastMana.js";
import { getDailyMana } from "./getDailyMana.js";

const router = express.Router();

router.get("/last-mana", getLastMana);
router.post("/daily-mana", getDailyMana);

export default router;
