import express from "express";
import { db } from "../lib/db.js";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";
// import {
//   requireAuth,
//   requireAdmin,
// } from "../middleware/betterAuthMiddleware.js";

const router = express.Router();

// Apply auth middleware to all admin routes
// router.use(requireAuth);
// router.use(requireAdmin);

router.get("/leaderboard/vg1", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || session.user.role !== "USER") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const users = await db.user.findMany({
      where: {
        role: { not: "ARCHIVED" },
        publicHighscore: true,
        schoolClass: {
          in: ["Class_1IM1", "Class_1IM2", "Class_1IM3", "Class_1IM4"],
        },
      },
      orderBy: { xp: "desc" },
      take: 10,
      select: {
        xp: true,
        title: true,
        name: true,
        image: true,
        level: true,
        class: true,
        guildName: true,
        schoolClass: true,
      },
    });

    res.json({ users });
  } catch (error) {
    console.error("Error counting dead users:", error);
    res.status(500).json({
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/leaderboard/vg2", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || session.user.role !== "USER") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const users = await db.user.findMany({
      where: {
        role: { not: "ARCHIVED" },
        publicHighscore: true,
        schoolClass: {
          in: ["Class_2IT1", "Class_2IT2", "Class_2IT3", "Class_2MP1"],
        },
      },
      orderBy: { xp: "desc" },
      take: 10,
      select: {
        xp: true,
        title: true,
        name: true,
        image: true,
        level: true,
        class: true,
        guildName: true,
        schoolClass: true,
      },
    });

    res.json({ users });
  } catch (error) {
    console.error("Error counting dead users:", error);
    res.status(500).json({
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
