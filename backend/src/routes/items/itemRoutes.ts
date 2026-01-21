import express from "express";
import { getTitleItems } from "./getTitleItems.js";
import { getObjectItems } from "./getObjectItems.js";
import { getBadgeItems } from "./getBadgeItems.js";
import { getDiceItems } from "./getDiceItems.js";

const router = express.Router();

router.get("/items/titles", getTitleItems);
router.get("/items/badges", getBadgeItems);
router.get("/items/dices", getDiceItems);
router.get("/items/objects", getObjectItems);

export default router;
