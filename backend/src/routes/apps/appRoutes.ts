import express from "express";
import { getApps } from "./getApps.js";

const router = express.Router();

router.get("/apps", getApps);

export default router;
