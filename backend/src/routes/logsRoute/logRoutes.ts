import express from "express";
import { getUserLog } from "./getUserLog.js";

const router = express.Router();

router.get("/logs/:userId", getUserLog);

export default router;
