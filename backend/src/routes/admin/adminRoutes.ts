import express from "express";
import { adminUpdateGuildName } from "./adminUpdateGuildname.js";
import { adminUpdateGuildMembers } from "./adminUpdateGuildMembers.js";
import { adminUpdateGuildLeader } from "./adminUpdateGuildLeader.js";
import { adminUpdateNextGuildLeader } from "./adminUpdateNextGuildLeader.js";
import { getGuilds } from "./getGuilds.js";

const router = express.Router();

// Collection endpoints
// router.get("/admin/deadCount", getDeadUserCount);
router.patch("/admin/guilds/:guildName/name", adminUpdateGuildName); // /users/dead

router.patch("/admin/guilds/:guildName/members", adminUpdateGuildMembers); // /users/dead

router.patch("/admin/guilds/:guildName/leader", adminUpdateGuildLeader); // /users/dead
router.patch("/admin/guilds/:guildName/nextLeader", adminUpdateNextGuildLeader); // /users/dead

router.patch("/admin/guilds", getGuilds);

export default router;
