import express from "express";
import { getGuildMembersForAbilityTarget } from "./getGuildMembersForAbilityTarget.js";
import { getGuildMembers } from "./getGuildMembers.js";
import { startGuildBattle } from "./startGuildBattle.js";
import { voteToStartNextBattle } from "./voteToStartNextBattle.js";
import { getGuildEnemies } from "./getGuildEnemies.js";
import { updateGuildName } from "./updateGuildName.js";
import { getGuildsAndMemberCountBySchoolClass } from "./getGuildsAndMemberCountBySchoolClass.js";

const router = express.Router();

// Get all members of a guild
router.get("/guilds/:guildName/members", getGuildMembers);
// GET /guilds/phoenixes/members

// Get guild members formatted for ability targeting
router.get(
  "/guilds/:guildName/members/ability-targets",
  getGuildMembersForAbilityTarget,
);

router.post("/guilds/:guildName/name", updateGuildName);

router.get(
  "/guilds?schoolclass=:schoolClass",
  getGuildsAndMemberCountBySchoolClass,
);

// Guild battle routes
router.post("/guilds/:guildName/battles", startGuildBattle);
router.post("/guilds/:guildName/battles/vote", voteToStartNextBattle);

// Guild enemy routes
router.get("/guilds/:guildName/enemies", getGuildEnemies);

export default router;
