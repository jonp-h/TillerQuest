import express from "express";
import { getNotifications } from "./getNotifications.js";
import { readNotification } from "./readNotification.js";

const router = express.Router();

router.get("/notifications/:userId", getNotifications);
router.post("/notifications/:userId/read", readNotification);

export default router;
