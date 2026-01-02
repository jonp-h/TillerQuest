import express from "express";
import { getGuildMembersForAbilityTarget } from "./getGuildMembersForAbilityTarget.js";
import { getGuildMembers } from "./getGuildMembers.js";
import { updateGuildName } from "./updateGuildName.js";

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

export default router;
