import express from "express";
import { getBaseUser } from "./getBaseUser.js";
import { getGameUser } from "./getGameUser.js";
import { getNewUser } from "./getNewUser.js";
import { getUserSettings } from "./getUserSettings.js";
import { getUserProfile } from "./getUserProfile.js";
import { getDeadUsers } from "./getDeadUsers.js";
import { getUserInventory } from "./getUserInventory.js";
import { getValhallaUsers } from "./getValhallaUsers.js";
import { getDeadUserCount } from "./getDeadUserCount.js";
import { getTotalUserCount } from "./getTotalUserCount.js";
import { updateUser } from "./updateUser.js";
import { purchaseItem } from "./purchaseItem.js";

const router = express.Router();

// Get user by ID (with query param for data type)
router.get("/users/:userId", getBaseUser); // /users/123
// Update/create user profile (account setup)
router.put("/users/:userId", updateUser);

router.get("/users/:userId/game", getGameUser); // /users/123/game
router.get("/users/:userId/settings", getUserSettings); // /users/123/settings
// Update user profile settings (after account creation)
router.patch("/users/:userId/settings", updateProfile);

router.get("/users/:userId/new", getNewUser); // /user/123/new

router.get("/users/:userId/inventory", getUserInventory); // /user/123/inventory
router.post("/users/:userId/inventory", purchaseItem);
router.patch("/users/:userId/equipment", updateEquipment);

// Get user by username (alternative lookup)
router.get("/users/username/:username", getUserProfile); // /users/username/john_doe

// Collection endpoints
router.get("/users/dead", getDeadUsers); // /users/dead
router.get("/users/valhalla", getValhallaUsers); // /users/valhalla
router.get("/users/count/total", getTotalUserCount); // /users/count/total
router.get("/users/count/dead", getDeadUserCount); // /users/count/dead

export default router;
