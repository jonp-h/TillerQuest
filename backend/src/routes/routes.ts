import express from "express";
import wishRoutes from "./wish/wishRoute.js";
import abilityRoutes from "./abilities/abilityRoutes.js";
import userRoutes from "./users/userRoutes.js";
import guildRoutes from "./guilds/guildRoutes.js";
import adminRoutes from "./admin/adminRoutes.js";
import gameRoutes from "./games/gameRoutes.js";
import itemRoutes from "./items/itemRoutes.js";
import notificationRoutes from "./notifications/notificationRoutes.js";
import logsRoutes from "./logsRoute/logRoutes.js";
import cosmicRoutes from "./cosmics/cosmicRoutes.js";

const routes = express.Router();

routes.use(wishRoutes);
routes.use(notificationRoutes);
routes.use(logsRoutes);
routes.use(gameRoutes);
routes.use(cosmicRoutes);
routes.use(userRoutes);
routes.use(itemRoutes);
routes.use(gameRoutes);
routes.use(guildRoutes);
routes.use(abilityRoutes);
routes.use(adminRoutes);

export default routes;
