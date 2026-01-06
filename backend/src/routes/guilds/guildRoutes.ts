import express from "express";
import { getGuildMembersForAbilityTarget } from "./getGuildMembersForAbilityTarget.js";
import { getGuildMembers } from "./getGuildMembers.js";
import { startGuildBattle } from "./startGuildBattle.js";
import { updateGuildName } from "./updateGuildName.js";
import { getGuildsAndMemberCountBySchoolClass } from "./getGuildsAndMemberCountBySchoolClass.js";
import { getGuildLeaderboard } from "./getGuildLeaderboard.js";

const router = express.Router();

// Get all members of a guild
router.get("/guilds/:guildName/members", getGuildMembers);

// Get guild members formatted for ability targeting
router.get(
  "/guilds/:guildName/members/ability-targets",
  getGuildMembersForAbilityTarget,
);

router.post("/guilds/:guildName/name", updateGuildName);

// /guilds?schoolClass=Class_1IM1
router.get("/guilds", getGuildsAndMemberCountBySchoolClass);

// Guild battle routes
router.post("/guilds/:guildName/battles", startGuildBattle);

router.get("/guilds/leaderboard", getGuildLeaderboard);

export default router;
