import express from "express";
import { getTitleItems } from "./getTitleItems.js";
import { getObjectItems } from "./getObjectItems.js";
import { getBadgeItems } from "./getBadgeItems.js";

const router = express.Router();

router.get("/items/titles", getTitleItems);
router.get("/items/badges", getBadgeItems);
router.get("/items/objects", getObjectItems);

export default router;
