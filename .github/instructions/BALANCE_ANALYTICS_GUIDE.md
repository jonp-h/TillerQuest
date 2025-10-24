# 🎯 Balance Analytics Guide

## Critical Balance Reports

### 1. Ability Balance Report

**Purpose**: Detect overpowered/underpowered abilities using duration-adjusted metrics.

#### Key Metrics

| Metric            | Description                                | Good Range          |
| ----------------- | ------------------------------------------ | ------------------- |
| **XP/Day**        | Average XP gained per user per day         | Depends on gem cost |
| **Balance Score** | Actual XP/Day ÷ Target XP/Day              | 0.5 - 1.5           |
| **XP/Resource**   | XP gained per resource (mana+health) spent | 10-35               |

#### Balance Targets by Gem Cost

| Gem Cost | Target XP/Day | Balance Score Range |
| -------- | ------------- | ------------------- |
| 1 gem    | 10-15 XP/day  | 0.8 - 1.2           |
| 2 gems   | 20-30 XP/day  | 0.8 - 1.2           |
| 4 gems   | 40-60 XP/day  | 0.8 - 1.2           |

#### Status Indicators

- 🔴 **OVERPOWERED** (Score > 1.5): Ability gives >50% more XP than target
- 🟠 **WEAK** (Score < 0.5): Ability gives <50% of target XP
- 🟢 **BALANCED** (Score 0.5-1.5): Within acceptable range
- ⚪ **UNUSED**: Nobody has used this ability (possible dead ability)
- 🔵 **PASSIVE**: Permanent duration (null XP expected)

#### How to Fix Imbalances

**If Overpowered (Score > 1.5):**

1. Reduce XP reward
2. Increase mana/health cost
3. Increase duration/cooldown
4. Reduce target count for multi-target abilities

**If Underpowered (Score < 0.5):**

1. Increase XP reward
2. Decrease mana/health cost
3. Decrease duration/cooldown
4. Add bonus effects (gold, etc.)

**If Unused:**

1. Check if too expensive (gemstone cost)
2. Check if parent ability is blocking access
3. Check if ability description is unclear
4. Consider buffing or removing

---

### 2. Class Power Comparison

**Purpose**: Ensure all classes gain roughly equal XP/Gold per day.

#### Balance Criteria

- All classes should be within **±15%** of average XP/day
- Power Score should be **0.85 - 1.15**

#### Status Indicators

- 🔴 **OVERPOWERED** (Score > 1.15): Class gains >15% more than average
- 🟠 **UNDERPOWERED** (Score < 0.85): Class gains >15% less than average
- 🟢 **BALANCED** (Score 0.85-1.15): Within acceptable range

#### Example Interpretation

If Wizards have a Power Score of **1.25**:

- Wizards gain 25% more XP than average
- This is OVERPOWERED (>15% advantage)
- Action: Nerf Wizard-exclusive abilities or buff other classes

---

## How to Use These Analytics

### Weekly Balance Check

1. **Open Analytics Dashboard** (`/gamemaster/analytics`)
2. **Check Ability Balance Report**:
   - Look at "Overpowered" filter
   - Identify abilities with Balance Score > 1.5
   - Note which classes own these abilities
3. **Check Class Power Comparison**:
   - Look for classes outside 0.85-1.15 range
   - Cross-reference with overpowered abilities
4. **Make Adjustments**:
   - Edit ability stats in database
   - Test changes with small group first
   - Re-check analytics after 3-7 days

### Red Flags 🚨

**Critical Issues to Fix Immediately:**

1. Any ability with Balance Score > 2.0 (double the target)
2. Any class with Power Score > 1.3 or < 0.7
3. Abilities with >200 uses but Score > 1.8 (widely exploited)
4. 4-gem abilities with Score < 0.5 (waste of gemstones)

### Duration Considerations

The system automatically adjusts for duration:

- **Instant abilities** (duration = 0): Can be used ~5x/day (limited by mana)
- **1-hour duration** (60 min): Can be used ~24x/day (impractical, but possible)
- **4-hour duration** (240 min): Can be used ~6x/day
- **8-hour duration** (480 min): Can be used ~3x/day
- **16-hour duration** (960 min): Can be used ~1.5x/day
- **24-hour duration** (1440 min): Can be used 1x/day
- **48-hour duration** (2880 min): Can be used 0.5x/day (every other day)
- **5-day duration** (7200 min): Can be used 0.2x/day (once per week)
- **Permanent** (null): Not used repeatedly (passive effects)

**Example**:

- An ability with 1440 min (24h) duration that gives 50 XP should have a Balance Score around 1.0 for a 4-gem ability (50 XP/day = target)
- An ability with 480 min (8h) duration that gives 50 XP but is used 3x/day would give 150 XP/day (Score = 3.0 = OVERPOWERED)

---

## Analytics Data Quality

### Required Data Volume

For accurate results, you need:

- **Minimum**: 7 days of data, 10+ active users
- **Recommended**: 14 days of data, 20+ active users
- **Optimal**: 30 days of data, 50+ active users

### Data Limitations

- **New abilities**: Need 3-7 days to get accurate usage patterns
- **Seasonal abilities**: May skew data if only available during cosmic events
- **Guild-based abilities**: Require active guild participation
- **Low-level abilities**: May be abandoned as users level up

---

## Quick Reference

### Balance Score Interpretation

| Score     | Status                  | Action                    |
| --------- | ----------------------- | ------------------------- |
| > 2.0     | 🚨 Critical Nerf Needed | Immediate action required |
| 1.5 - 2.0 | 🔴 Overpowered          | Nerf within 1 week        |
| 1.2 - 1.5 | 🟡 Slightly Strong      | Monitor closely           |
| 0.8 - 1.2 | 🟢 Perfectly Balanced   | No action needed          |
| 0.5 - 0.8 | 🟡 Slightly Weak        | Consider buffing          |
| 0.2 - 0.5 | 🟠 Underpowered         | Buff within 1 week        |
| < 0.2     | 🚨 Critical Buff Needed | Immediate action required |
| 0.0       | ⚪ Unused               | Investigate why           |

### Class Power Score Interpretation

| Score       | Status                  | Action               |
| ----------- | ----------------------- | -------------------- |
| > 1.3       | 🚨 Critical Nerf Needed | Nerf class abilities |
| 1.15 - 1.3  | 🔴 Overpowered          | Nerf within 1 week   |
| 0.85 - 1.15 | 🟢 Balanced             | No action needed     |
| 0.7 - 0.85  | 🟠 Underpowered         | Buff within 1 week   |
| < 0.7       | 🚨 Critical Buff Needed | Buff class abilities |
