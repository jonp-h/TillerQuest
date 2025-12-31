import express from "express";
import { getWishes } from "./getWishes.js";
import { voteForWish } from "./voteForWish.js";

const router = express.Router();

// Mount wish routes
router.get("/wishes", getWishes);
router.post("/wishes/:userId/vote", voteForWish);

export default router;
