import express from "express";
import { getWishes } from "./getWishes.js";
import { voteForWish } from "./voteForWish.js";
import { getScheduledWishesCount } from "./getScheduledWishesCount.js";

const router = express.Router();

// Mount wish routes
router.get("/wishes", getWishes);
router.get("/wishes/scheduled/count", getScheduledWishesCount);
router.post("/wishes/:userId/vote", voteForWish);

export default router;
