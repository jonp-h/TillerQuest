import { db } from "../lib/db.js";
import { levelFromXp } from "../utils/progression/xpProgression.js";
import { PrismaTransaction } from "../types/prismaTransaction.js";

type GemstoneStrategy = "none" | "rate-only" | "full-recalc";

// ***************************************************************************************************************
// ----------- INFO ----------------------------------------------------------------------------------------------
//
//  This script is intended to be run once to migrate user levels and gemstones
// The script should only be run once after the XP curve has changed
// OR if the amount of gemstones per level has been changed
//
// Run with `pnpx tsx src/db/xpAndGemstoneMigration.ts`
// Ensure you have a backup of your database before running this script, and that abilities/purchases have been refunded beforehand!
// ---------------------------------------------------------------------------------------------------------------
// ***************************************************************************************************************

const OLD_XP_PER_LEVEL = 1000;
const OLD_GEMSTONES_PER_LEVEL = 2;
const NEW_GEMSTONES_PER_LEVEL = 2;

// Pick your mode:
// - none: only migrate levels, do not change gemstones. is usually the safest
// - rate-only: remove/add the extra x gemstone per old linear level. is harsher and may remove many gemstones if new curved levels are lower than old linear levels.
// - full-recalc: apply full delta between old(x/lvl linear) and new(x/lvl curved). is safest politically, but keeps historical gemstone inflation.
const GEMSTONE_STRATEGY: GemstoneStrategy = "full-recalc";

// Start with dry run true, review output, then set false to apply.
const DRY_RUN = true;

// Optional safety filter:
// const EXCLUDED_ROLES = ["ARCHIVED"] as const;

const toNonNegativeInt = (value: number) =>
  Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);

const oldLinearLevelFromXp = (xp: number) =>
  Math.floor(toNonNegativeInt(xp) / OLD_XP_PER_LEVEL);

function gemstoneDeltaForUser(
  strategy: GemstoneStrategy,
  oldLinearLevel: number,
  newLevel: number,
): number {
  switch (strategy) {
    case "none":
      return 0;
    case "rate-only":
      // They historically got +1 extra gemstone per level (2 instead of 1)
      return -(
        oldLinearLevel *
        (OLD_GEMSTONES_PER_LEVEL - NEW_GEMSTONES_PER_LEVEL)
      );
    case "full-recalc":
      // Delta between old model and new model level reward totals
      return (
        newLevel * NEW_GEMSTONES_PER_LEVEL -
        oldLinearLevel * OLD_GEMSTONES_PER_LEVEL
      );
    default:
      return 0;
  }
}

async function main() {
  console.log("Starting XP/level migration");
  console.log("Dry run:", DRY_RUN);
  console.log("Gemstone strategy:", GEMSTONE_STRATEGY);

  const users = await db.user.findMany({
    // Ensure this is done for all users, including those archived
    // where: {
    //   role: {
    //     notIn: [...EXCLUDED_ROLES],
    //   },
    // },
    select: {
      id: true,
      name: true,
      lastname: true,
      role: true,
      xp: true,
      level: true,
      gemstones: true,
    },
    orderBy: {
      xp: "desc",
    },
  });

  let changedLevels = 0;
  let changedGemstones = 0;
  let totalLevelDelta = 0;
  let totalGemstoneDelta = 0;

  const previewRows: Array<{
    id: string;
    name: string | null;
    lastname: string | null;
    role: string;
    xp: number;
    oldStoredLevel: number;
    oldLinearLevel: number;
    newLevel: number;
    levelDelta: number;
    gemstonesBefore: number;
    gemstonesAfter: number;
    gemstoneDeltaApplied: number;
  }> = [];

  for (const user of users) {
    const xp = toNonNegativeInt(user.xp);
    const oldStoredLevel = toNonNegativeInt(user.level);
    const oldLinearLevel = oldLinearLevelFromXp(xp);
    const newLevel = levelFromXp(xp);

    const levelDelta = newLevel - oldStoredLevel;

    const proposedGemDelta = gemstoneDeltaForUser(
      GEMSTONE_STRATEGY,
      oldLinearLevel,
      newLevel,
    );

    // Never go below 0 gemstones. Could consider to allow negative gemstones, as refunds of purchases will fix the negative balance.
    const gemstonesAfter = user.gemstones + proposedGemDelta;
    const gemstoneDeltaApplied = gemstonesAfter - user.gemstones;

    if (levelDelta !== 0) {
      changedLevels++;
      totalLevelDelta += levelDelta;
    }

    if (gemstoneDeltaApplied !== 0) {
      changedGemstones++;
      totalGemstoneDelta += gemstoneDeltaApplied;
    }

    previewRows.push({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      role: user.role,
      xp,
      oldStoredLevel,
      oldLinearLevel,
      newLevel,
      levelDelta,
      gemstonesBefore: toNonNegativeInt(user.gemstones),
      gemstonesAfter,
      gemstoneDeltaApplied,
    });
  }

  console.table(previewRows.filter((row) => row.role !== "NEW"));
  console.log("Users scanned:", users.length);
  console.log("Users with level change:", changedLevels);
  console.log("Users with gemstone change:", changedGemstones);
  console.log("Total level delta:", totalLevelDelta);
  console.log("Total gemstone delta:", totalGemstoneDelta);

  if (DRY_RUN) {
    console.log("Dry run complete. No database changes were applied.");
    return;
  }

  await db.$transaction(async (tx: PrismaTransaction) => {
    for (const row of previewRows) {
      const updates: {
        level?: number;
        gemstones?: { increment: number };
      } = {};

      if (row.levelDelta !== 0) {
        updates.level = row.newLevel;
      }

      if (row.gemstoneDeltaApplied !== 0) {
        updates.gemstones = { increment: row.gemstoneDeltaApplied };
      }

      if (Object.keys(updates).length === 0) continue;

      await tx.user.update({
        where: { id: row.id },
        data: updates,
      });
    }
  });

  console.log("Migration applied successfully.");
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
