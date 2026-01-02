import express from "express";
import { checkIfTargetsHavePassive } from "./checkIfTargetsHavePassive.js";

const router = express.Router();

router.post("/abilities/check", checkIfTargetsHavePassive);

export default router;
