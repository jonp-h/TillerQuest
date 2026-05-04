import express from "express";
import { getScheduledEvents } from "./getScheduledEvents.js";

const router = express.Router();

// Mount scheduled routes
router.get("/scheduled/events", getScheduledEvents);

export default router;
