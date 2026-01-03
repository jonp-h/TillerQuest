import express from "express";
import wishRoutes from "./wish/wishRoute.js";
import abilityRoutes from "./abilities/abilityRoutes.js";
import userRoutes from "./users/userRoutes.js";
import guildRoutes from "./guilds/guildRoutes.js";
import adminRoutes from "./admin/adminRoutes.js";
import manaRoutes from "./mana/manaRoutes.js";
import gameRoutes from "./games/gameRoutes.js";

const routes = express.Router();

routes.use(wishRoutes);
routes.use(userRoutes);
routes.use(manaRoutes);
routes.use(gameRoutes);
routes.use(adminRoutes);
routes.use(guildRoutes);
routes.use(abilityRoutes);

export default routes;
