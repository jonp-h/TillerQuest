import express from "express";
import { getCosmicEvent } from "./getCosmicEvent.js";

const router = express.Router();

// Get current cosmic event
router.get("/cosmics/events", getCosmicEvent);
// GET /cosmics/events?schoolClass=Class_1IM

export default router;
