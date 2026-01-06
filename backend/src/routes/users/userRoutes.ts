import express from "express";
import { getBaseUser } from "./getBaseUser.js";
import { getGameUser } from "./getGameUser.js";
import { getNewUser } from "./getNewUser.js";
import { getUserSettings } from "./getUserSettings.js";
import { getUserProfile } from "./getUserProfile.js";
import { getDeadUsers } from "./getDeadUsers.js";
import { getUserInventory } from "./getUserInventory.js";
import { getValhallaUsers } from "./getValhallaUsers.js";
import { updateUser } from "./updateUser.js";
import { purchaseItem } from "./purchaseItem.js";
import { getUserTurns } from "./getUserTurns.js";
import { getUserAbilities } from "./getUserAbilities.js";
import { getUserProfileAbilities } from "./getUserProfileAbilities.js";
import { getUserDungeonAbilities } from "./getUserDungeonAbilities.js";
import { checkIfUserOwnsAbility } from "./checkIfUserOwnsAbility.js";
import { purchaseAbility } from "./purchaseAbility.js";
import { updateUserSettings } from "./updateUserSettings.js";
import { equipItem } from "./equipItem.js";
import { getUserPassives } from "./getUserPassives.js";
import { getLastMana } from "./lastMana.js";
import { getDailyMana } from "./getDailyMana.js";
import { getGuildByUserId } from "./getGuildByUserId.js";
import { voteToStartNextBattle } from "./voteToStartNextGuildBattle.js";
import { getGuildEnemiesByUserId } from "./getGuildEnemiesByUserId.js";

const router = express.Router();

router.get("/users/:userId/new", getNewUser);
// Get user by ID (with query param for data type)
router.get("/users/:userId", getBaseUser);
router.get("/users/username/:username/profile", getUserProfile);

// Update/create user profile (account setup)
router.put("/users/:userId", updateUser);

router.get("/users/:userId/last-mana", getLastMana);
router.post("/users/:userId/daily-mana", getDailyMana);

router.get("/users/:userId/game", getGameUser);

router.get("/users/:username/settings", getUserSettings);
// Update user profile settings (after account creation)
router.patch("/users/:username/settings", updateUserSettings);

router.get("/users/:userId/guild", getGuildByUserId);
router.post("/users/:userId/guild/battles/vote", voteToStartNextBattle);
router.get("/users/:userId/guild/enemies", getGuildEnemiesByUserId);

router.get("/users/:userId/turns", getUserTurns);

router.get("/users/:userId/inventory", getUserInventory);
router.post("/users/:userId/inventory", purchaseItem);
router.patch("/users/:userId/equipment", equipItem);

// User ability routes
router.get("/users/:userId/abilities", getUserAbilities);
router.post("/users/:userId/abilities", purchaseAbility);
router.get("/users/:userId/passives", getUserPassives);
router.get("/users/:userId/abilities/profile", getUserProfileAbilities);
router.get("/users/:userId/abilities/dungeon", getUserDungeonAbilities);
// TODO: Considering implementing together with abilityFetch route
router.get(
  "/users/:userId/abilities/:abilityName/owns",
  checkIfUserOwnsAbility,
);

// Collection endpoints
router.get("/users/dead", getDeadUsers);
router.get("/users/valhalla", getValhallaUsers);

export default router;
