import express from "express";
import leaderboardRoutes from "./leaderboard.js";
import wishRoutes from "./wish/wishRoute.js";
import abilityRoutes from "./ability/index.js";
import userRoutes from "./user/index.js";
import guildRoutes from "./guild/index.js";
import adminRoutes from "./admin/index.js";
import { requireActiveUser, requireAuth } from "middleware/authMiddleware.js";

const routes = express.Router();

routes.use(wishRoutes, requireAuth, requireActiveUser);
// routes.use(abilityRoutes);
// routes.use(userRoutes);
// routes.use(guildRoutes);
// routes.use(adminRoutes);

export default routes;
