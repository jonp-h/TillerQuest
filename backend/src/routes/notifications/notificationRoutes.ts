import express from "express";
import { getNotifications } from "./getNotifications.js";
import { readNotification } from "./readNotification.js";

const router = express.Router();

router.get("/notifications", getNotifications);
router.post("/notifications/:id/read", readNotification);

export default router;
