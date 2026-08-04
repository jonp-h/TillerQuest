const toNonNegativeInt = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

// XP needed to go from current level to the next level
export const xpNeededForNextLevel = (level: number): number => {
  if (level < 10) return 400 + 80 * level; // 400 - 1200
  if (level < 20) return 1200 + 100 * (level - 10); // 1200 - 2200
  if (level < 30) return 2200 + 120 * (level - 20); // 2200 - 3400
  return 3500;

  // Considered a more complex curve, but it was deemed too punishing:
  // return 4000;
  // if (level < 40) return 3700 + 170 * (level - 30); // 3700 - 5400
  // return 5400 + 170 * (level - 40); // 5400 - 7100
};

// Cumulative xp required to reach a level
export const xpForLevel = (level: number): number => {
  let total = 0;

  for (let i = 0; i < level; i++) {
    total += xpNeededForNextLevel(i);
  }
  return total;
};

// Derive level from total Xp with soft-curve + cap
export const levelFromXp = (totalXp: number): number => {
  const xp = toNonNegativeInt(totalXp);

  let level = 0;
  let spent = 0;

  while (spent <= xp) {
    const needed = xpNeededForNextLevel(level);
    if (spent + needed > xp) break;
    spent += needed;
    level++;
  }

  return level;
};

// Used for ui progress bars and other visualizations
export const getXpProgress = (totalXp: number) => {
  const xp = toNonNegativeInt(totalXp);
  const level = levelFromXp(totalXp);

  const xpAtLevelStart = xpForLevel(level);
  const xpForNextLevel = xpNeededForNextLevel(level);
  const xpIntoCurrentLevel = Math.max(0, xp - xpAtLevelStart);

  return {
    // level,
    // totalXp: xp,
    xpAtLevelStart,
    xpIntoCurrentLevel,
    xpForNextLevel,
    // progressPercentage: xpForNextLevel > 0 ? (xpIntoCurrentLevel / xpForNextLevel) * 100 : 0,
  };
};

export const applyXpDelta = (currentXp: number, delta: number) => {
  const beforeXp = toNonNegativeInt(currentXp);
  const beforeLevel = levelFromXp(beforeXp);
  const afterXp = toNonNegativeInt(beforeXp + delta);
  const afterLevel = levelFromXp(afterXp);

  return {
    beforeXp,
    afterXp,
    appliedDeltaXp: afterXp - beforeXp,
    beforeLevel,
    afterLevel,
    levelDifference: afterLevel - beforeLevel,
  };
};
