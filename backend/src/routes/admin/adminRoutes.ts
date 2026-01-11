import express from "express";
import { adminUpdateGuild } from "./adminUpdateGuild.js";
import { getGuilds } from "./getGuilds.js";
import { getAbilityUsageStats } from "./getAbilityUsageStats.js";
import { getResourceAverages } from "./getResourceAverages.js";
import { getResourceGainStatsMultiple } from "./getResourceGainStatsMultiple.js";
import { getManaEfficiencyStats } from "./getManaEfficiencyStats.js";
import { getAbilityEfficiencyStatsMultiple } from "./getAbilityEfficiencyStatsMultiple.js";
import { getGameGoldStatsMultiple } from "./getGameGoldStatsMultiple.js";
import { getDungeonStatsMultiple } from "./getDungeonStatsMultiple.js";
import { getAbilityBalanceReport } from "./getAbilityBalanceReport.js";
import { getClassPowerComparison } from "./getClassPowerComparison.js";
import { adminGetWishes } from "./adminGetWishes.js";
import { adminScheduleWish } from "./adminScheduleWish.js";
import { adminResetWish } from "./adminResetWish.js";
import { adminGetSystemNotifications } from "./adminGetSystemNotifications.js";
import { adminCreateSystemNotification } from "./adminCreateSystemNotification.js";
import { adminUpdateSystemNotification } from "./adminUpdateSystemNotification.js";
import { adminDeleteSystemNotification } from "./adminDeleteSystemNotification.js";
import { adminRollDeathSave } from "./adminRollDeathSave.js";
import { adminResurrectUser } from "./adminResurrectUser.js";
import { adminGetApplicationSettings } from "./adminGetApplicationSettings.js";
import { adminUpdateApplicationSettings } from "./adminUpdateApplicationSettings.js";
import { adminRandomCosmic } from "./adminRandomCosmic.js";
import { adminSelectCosmic } from "./adminSelectCosmic.js";
import { adminRecommendCosmic } from "./adminRecommendCosmic.js";
import { adminGetAllCosmics } from "./adminGetAllCosmics.js";
import { adminGetRecommendedCosmic } from "./adminGetRecommendedCosmic.js";
import { adminGetSelectedCosmics } from "./adminGetSelectedCosmics.js";
import { adminGetUsers } from "./adminGetUsers.js";
import { adminUpdateUser } from "./adminUpdateUser.js";
import { adminUpdateUserRole } from "./adminUpdateUserRole.js";
import { adminResetUser } from "./adminResetUser.js";
import { adminGetDungeonInfo } from "./adminGetDungeonInfo.js";
import { adminGetSpecialStatuses } from "./adminGetSpecialStatuses.js";
import { adminDeleteGuildEnemies } from "./adminDeleteGuildEnemies.js";
import { getDeadUserCount } from "./getDeadUserCount.js";
import { getTotalUserCount } from "./getTotalUserCount.js";
import { adminGetAllLogs } from "./adminGetAllLogs.js";
import { adminHealUsers } from "./adminHealUsers.js";
import { adminDamageUsers } from "./adminDamageUsers.js";
import { adminGiveMana } from "./adminGiveMana.js";
import { adminGiveGold } from "./adminGiveGold.js";
import { adminGiveXp } from "./adminGiveXp.js";
import { adminGiveArenaTokens } from "./adminGiveArenaTokens.js";
import { requireAdmin } from "middleware/authMiddleware.js";

const router = express.Router();

router.use("/admin", requireAdmin);

// Guild management routes
router.patch("/admin/guilds/:guildName", adminUpdateGuild);
router.get("/admin/guilds", getGuilds);

// Wish management routes
router.get("/admin/wishes", adminGetWishes);
router.patch("/admin/wishes/:wishId/schedule", adminScheduleWish);
router.post("/admin/wishes/:wishId/reset", adminResetWish);

// System notification routes
router.get("/admin/notifications", adminGetSystemNotifications);
router.post("/admin/notifications", adminCreateSystemNotification);
router.patch("/admin/notifications/:id", adminUpdateSystemNotification);
router.delete("/admin/notifications/:id", adminDeleteSystemNotification);

// User resurrection routes
router.post("/admin/death-saves/roll", adminRollDeathSave);
router.post("/admin/users/:userId/resurrect", adminResurrectUser);
router.delete("/admin/guilds/:guildName/enemies", adminDeleteGuildEnemies);

// Application settings routes
router.get("/admin/settings", adminGetApplicationSettings);
router.patch("/admin/settings", adminUpdateApplicationSettings);

// Cosmic event routes
router.post("/admin/cosmics/random", adminRandomCosmic);
router.post("/admin/cosmics/:cosmicName/select", adminSelectCosmic);
router.post("/admin/cosmics/:cosmicName/recommend", adminRecommendCosmic);
router.get("/admin/cosmics", adminGetAllCosmics);
router.get("/admin/cosmics/recommended", adminGetRecommendedCosmic);
router.get("/admin/cosmics/selected", adminGetSelectedCosmics);

// User management routes
router.get("/admin/users", adminGetUsers); // GET /admin/users?fields=basic|admin|full
router.get("/admin/users/count/total", getTotalUserCount);
router.get("/admin/users/count/dead", getDeadUserCount);
router.patch("/admin/users/:userId", adminUpdateUser);
router.patch("/admin/users/:userId/role", adminUpdateUserRole);
router.post("/admin/users/:userId/reset", adminResetUser);

// Special statuses and dungeon info
router.get("/admin/special-statuses", adminGetSpecialStatuses);
router.get("/admin/dungeons", adminGetDungeonInfo);

router.get("/admin/logs", adminGetAllLogs);

// Admin powers - Bulk user operations
router.post("/admin/powers/heal", adminHealUsers);
router.post("/admin/powers/damage", adminDamageUsers);
router.post("/admin/powers/give-xp", adminGiveXp);
router.post("/admin/powers/give-mana", adminGiveMana);
router.post("/admin/powers/give-arenatokens", adminGiveArenaTokens);
router.post("/admin/powers/give-gold", adminGiveGold);

// Analytics routes
router.get("/admin/analytics/ability-usage", getAbilityUsageStats);
// GET /admin/analytics/ability-usage?days=14

router.get("/admin/analytics/resource-averages", getResourceAverages);
// GET /admin/analytics/resource-averages

router.get("/admin/analytics/resource-gains", getResourceGainStatsMultiple);
// GET /admin/analytics/resource-gains

router.get("/admin/analytics/mana-efficiency", getManaEfficiencyStats);
// GET /admin/analytics/mana-efficiency

router.get(
  "/admin/analytics/ability-efficiency",
  getAbilityEfficiencyStatsMultiple,
);
// GET /admin/analytics/ability-efficiency

router.get("/admin/analytics/game-gold", getGameGoldStatsMultiple);
// GET /admin/analytics/game-gold

router.get("/admin/analytics/dungeon-stats", getDungeonStatsMultiple);
// GET /admin/analytics/dungeon-stats

router.get("/admin/analytics/ability-balance", getAbilityBalanceReport);
// GET /admin/analytics/ability-balance?days=14

router.get("/admin/analytics/class-power", getClassPowerComparison);
// GET /admin/analytics/class-power?days=14

export default router;
