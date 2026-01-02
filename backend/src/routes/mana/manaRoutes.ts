import express from "express";
import { getLastMana } from "./lastMana.js";

const router = express.Router();

// Mount wish routes
router.get("/last-mana/:userId", getLastMana);

export default router;
