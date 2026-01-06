import express from "express";
import {
  ipRateLimit,
  validateRequestSignature,
  apiKeyRateLimit,
  securityHeaders,
} from "../lib/middleware.js";
import { logger } from "lib/logger.js";
import {
  getVg1Leaderboard,
  getVg2Leaderboard,
} from "utils/users/getLeaderboards.js";

const router = express.Router();

// Apply auth middleware to all admin routes
// router.use(requireAuth);
// router.use(requireAdmin);

// Security middleware stack
router.use(securityHeaders);
router.use(ipRateLimit); // Apply IP-based rate limiting first
router.use(apiKeyRateLimit); // Apply API key-based rate limiting
router.use(validateRequestSignature); // Validate API authentication
// router.use(validateOrigin(["https://localhost:3000"])); // Replace with actual domain or ensure validateOrigin returns a middleware

router.get("/leaderboard/vg1", async (req, res) => {
  try {
    const users = await getVg1Leaderboard();

    res.json({ users });
  } catch (error) {
    logger.error("Error getting leaderboard vg1:", error);
    res.status(500).json({
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/leaderboard/vg2", async (req, res) => {
  try {
    const users = await getVg2Leaderboard();

    res.json({ users });
  } catch (error) {
    logger.error("Error getting leaderboard vg2:", error);
    res.status(500).json({
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
