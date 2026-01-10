import { Router } from "express";
import { useAbility } from "./useAbility.js";
import { getAbilityHierarchy } from "./getAbilityHierarchy.js";
import { getDungeonAbilities } from "./getDungeonAbilities.js";
import { getAbilityAndOwnershipByName } from "./getAbilityAndOwnershipByName.js";
import { checkIfTargetsHavePassive } from "./checkIfTargetsHavePassive.js";

const router = Router();

// POST /abilities/use - Use an ability on target(s)
router.post("/abilities/:abilityName/use", useAbility);

// GET /abilities/hierarchy - Get ability tree structure
router.get("/abilities/hierarchy", getAbilityHierarchy);

// GET /abilities/dungeon - Get all dungeon abilities
router.get("/abilities/dungeon", getDungeonAbilities);

// GET /abilities/:abilityName - Get specific ability details
router.get("/abilities/:abilityName", getAbilityAndOwnershipByName);

// POST /abilities/check - Check if targets have passive
router.post("/abilities/:abilityName/passive-check", checkIfTargetsHavePassive);

export default router;
