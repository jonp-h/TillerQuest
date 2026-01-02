import express from "express";
import leaderboardRoutes from "./leaderboard.js";
import wishRoutes from "./wish/wishRoute.js";
import abilityRoutes from "./ability/index.js";
import userRoutes from "./users/userRoutes.js";
import guildRoutes from "./guilds/guildRoutes.js";
import adminRoutes from "./admin/adminRoutes.js";
import { requireActiveUser, requireAuth } from "middleware/authMiddleware.js";
import manaRoutes from "./mana/manaRoutes.js";
import gameRoutes from "./game/gameRoutes.js";

const routes = express.Router();

routes.use(wishRoutes);
routes.use(userRoutes);
routes.use(manaRoutes);
routes.use(gameRoutes);
routes.use(adminRoutes);
routes.use(guildRoutes);
// routes.use(leaderboardRoutes);
// routes.use(abilityRoutes);

export default routes;
