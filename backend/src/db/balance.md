GitHub Copilot: # TillerQuest Ability System - Complete Design Summary

## 🎯 **Game Context & Rules**

- **Duration**: 360 days over 2 years (classroom gamification)
- **Player Health**: 40 HP base (Barbarians can reach 50 HP with upgrades)
- **Daily Mana**: 1-5 mana per day (+2 extra for Wizards = 7 total)
- **Damage Rate**: ~5 HP damage per week (5 days of play)
- **Leveling**: Once per week on average
- **Gemstone Income**: 2 gemstones per level = ~102 total over 360 days

## 💎 **Gemstone Cost Tier System (Clean 1-2-3-4)**

- **Tier 1**: 1 gemstone (root abilities)
- **Tier 2**: 2 gemstones (basic abilities)
- **Tier 3**: 4 gemstones (ultimate abilities)
- **Maximum**: 4 gemstones (no 6-cost abilities to keep progression reasonable)

## ⚡ **Mana Cost Tiers**

- **Tier 1**: 2-3 mana (25-50 XP abilities)
- **Tier 2**: 3-4 mana (50-100 XP abilities)
- **Tier 3**: 4-6 mana (100-200 XP abilities)
- **Tier 4**: 10-15 mana (400-600 XP abilities)
- **Duration Penalty**: Reduced mana costs for long-duration abilities to prevent double punishment

## 🩸 **Health Cost Tiers (% of 40 HP max)**

This should generally be considered to be a bit on the "evil side", to encourage team-play and healing. The following health cost is not followed too much:

- **Tier 1**: 3 HP (7.5%) for 25 XP abilities
- **Tier 2**: 5 HP (12.5%) for 50 XP abilities
- **Tier 3**: 8 HP (20%) for 100+ XP abilities
- **Safety Buffer**: Players retain 32+ HP after worst-case usage

## 🎖️ **Experience (XP) Tier System**

- **Tier 1**: 25 XP (basic abilities)
- **Tier 2**: 50 XP (intermediate abilities)
- **Tier 3**: 100 XP (advanced abilities)
- **Tier 4**: 200 XP (expert abilities)
- **Tier 5**: 400 XP (master abilities)
- **Tier 6**: 600 XP (ultimate abilities)
- **Passive Abilities**: null XP (permanent upgrades don't need XP rewards)

## ⏰ **Duration & Balance Philosophy**

- **Duration Penalty**: Long-duration abilities get XP bonuses and mana reductions
  - 4-16 hours: +50% XP, -10% mana
  - 16+ hours: +100% XP, -20% mana
  - 2+ days: +150% XP, -30% mana
- **Lockout Compensation**: Players fairly rewarded for abilities they can't use again for days

## 🤝 **Cooperation Design Principles**

1. **Encourage Team Play**: Low-cost abilities that help others (Essence-Transfer, Bandage, Performance)
2. **Discourage Pure Selfishness**: Higher costs for purely selfish abilities (Postpone series)
3. **Resource Interdependence**: Wizards support guild with mana, Druids with healing, etc.
4. **Guild-Wide Benefits**: Abilities like Inspiration (+5 mana to ALL for 5 days) at affordable costs

## 🎲 **Values & Dice Notation Design**

- **Fixed Values**: Permanent upgrades (health bonuses, daily mana increases)
- **Dice for Engagement**: Active abilities use dice (1d4 to 2d10, special 1d20 for rare effects)
- **Tier Scaling**: Higher tiers get better dice or more dice
- **Target Consideration**: AoE abilities get slightly lower individual values than single-target

## 📊 **Progression Timeline & Balance**

### **Total Gemstone Costs by Class:**

- **Common Trees**: 38 gemstones (Health + Mana + Trickery)
- **Class-Specific**: 19-22 gemstones per class
- **Total Investment**: 57-60 gemstones per class
- **Completion Timeline**: Month 6.5-7 (out of 12 months)
- **Remaining Budget**: ~42 gemstones for future common trees

### **Example Cooperation Abilities (Well-Balanced):**

- **Essence-Transfer**: 2 mana, 1 gem → 1d4 mana to others
- **Bandage**: 2 mana, 2 gems → 1d4 healing to others
- **Performance**: 2 mana, 2 gems → 1d6% XP boost for ALL guild (1 hour)
- **Inspiration**: 2 mana, 2 gems → +5 max mana for ALL guild (5 days)
- **Crimson-Bond**: 3 HP, 2 gems → Transfer 3 HP to others

## 🎯 **Key Success Metrics**

✅ **Balanced Progression**: Players complete abilities around month 7, leaving room for expansion  
✅ **Meaningful Choices**: Limited resources force strategic decisions  
✅ **Class Viability**: All classes competitive with unique cooperation roles  
✅ **Cooperation Incentives**: Team abilities more cost-effective than selfish ones  
✅ **Extended Engagement**: 42 gemstones remaining for additional common trees  
✅ **Clean Tier Systems**: Easy-to-understand progression (1-2-4 gems, 25-50-100-200-400-600 XP)
