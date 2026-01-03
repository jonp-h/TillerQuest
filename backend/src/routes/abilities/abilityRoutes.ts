import { Router } from "express";
import { useAbility } from "./useAbility.js";
import { getAbilityHierarchy } from "./getAbilityHierarchy.js";
import { getDungeonAbilities } from "./getDungeonAbilities.js";
import { getAbilityByName } from "./getAbilityByName.js";
import { checkIfTargetsHavePassive } from "./checkIfTargetsHavePassive.js";

const router = Router();

// POST /abilities/use - Use an ability on target(s)
router.post("/abilities/use", ...useAbility);

// GET /abilities/hierarchy - Get ability tree structure
router.get("/abilities/hierarchy", ...getAbilityHierarchy);

// GET /abilities/dungeon - Get all dungeon abilities
router.get("/abilities/dungeon", ...getDungeonAbilities);

// GET /abilities/:abilityName - Get specific ability details
router.get("/abilities/:abilityName", ...getAbilityByName);

// POST /abilities/check - Check if targets have passive
router.post("/abilities/check", ...checkIfTargetsHavePassive);

export default router;
