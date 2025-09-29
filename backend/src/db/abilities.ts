interface Ability {
  id: number;
  name: string;
  category:
    | "Health"
    | "Mana"
    | "Heal"
    | "Trickery"
    | "Wizard"
    | "Druid"
    | "Warlock"
    | "Barbarian"
    | "Bard"
    | "Fighter"
    | "Arena"
    | "Dungeon"
    | "Cosmic";
  type: // Abilities
  | "Heal"
    | "XP"
    | "Mana"
    | "Swap"
    | "Transfer"
    | "Trade"
    | "Revive"
    | "Damage"
    | "ArenaToken"
    | "Gold"

    // Dungeons
    | "TurnPassive"
    | "DungeonAttack"
    | "VictoryGold"
    | "VictoryMana"

    // Passives
    | "Access"
    | "Deathsave"
    | "Cosmic"
    | "All"
    | "Health"
    | "LastStand"
    | "DailyMana"
    | "ManaPassive"
    | "Experience"
    | "Protection"
    | "ManaShield"
    | "GoldShield"
    | "Strength"
    | "Agility"
    | "Trickery"
    | "Postpone"
    | "Magic"
    | "Adventurer"
    | "Arena"
    | "Turns"
    | "Crit"
    | "GoldPassive"
    | "IncreaseHealth"
    | "DecreaseHealth"
    | "IncreaseMana"
    | "DecreaseMana";
  target: "Self" | "SingleTarget" | "All" | "Others";
  description: string;
  duration: 60 | 180 | 240 | 480 | 960 | 1440 | 2880 | 7200 | null; // in minutes, or null for no duration. integer: x * 10 minutes
  icon: string;
  gemstoneCost: 0 | 1 | 2 | 4;
  manaCost: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 15 | null;
  healthCost: 2 | 3 | 5 | 6 | 10 | 12 | null;
  xpGiven: 20 | 40 | 80 | 120 | 160 | 200 | 240 | 320 | 480 | null;
  diceNotation: string | null;
  value: number | null;
  parentAbility: string | null;
  isDungeon?: boolean; // optional, used for dungeon abilities
  purchaseable?: boolean; // optional, used for cosmic abilities
  cosmicEvent?: string[]; // optional, used for cosmic abilities
}

const health: Ability[] = [
  {
    id: 2,
    name: "Bandage",
    category: "Heal",
    type: "Heal",
    target: "SingleTarget",
    description: "Restores 1 health to a target.",
    duration: null,
    icon: "Heal.png",
    gemstoneCost: 1,
    manaCost: 2,
    healthCost: null,
    xpGiven: 20,
    diceNotation: null,
    value: 1,
    parentAbility: null,
  },
  // Base efficiency = 20 XP / 2 Mana = 10
  // Final Efficiency: 10
  {
    id: 1,
    name: "Vigor",
    category: "Health",
    type: "Health",
    target: "Self",
    description:
      "For the next 16 hours: Every time you are healed, you gain 2 extra health.",
    duration: 960, // 16 hours
    icon: "Vigor.png",
    gemstoneCost: 2,
    manaCost: 2,
    healthCost: null,
    xpGiven: 40,
    diceNotation: null,
    value: 2,
    parentAbility: "Bandage",
  },
  // Base: 40 XP / 2 Mana = 20 (passive)
  // Duration penalty: -35% = 13
  // Final: 13 efficiency
  {
    id: 3,
    name: "Enhanced-Constitution",
    category: "Health",
    type: "IncreaseHealth",
    target: "Self",
    description: "Gain 2 extra maximum health.",
    duration: null,
    icon: "Enhanced-Vigor.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 2,
    parentAbility: "Vigor",
  },
  {
    id: 4,
    name: "Superior-Constitution",
    category: "Health",
    type: "IncreaseHealth",
    target: "Self",
    description: "Gain 3 extra health.",
    duration: null,
    icon: "Superior-Vigor.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 3,
    parentAbility: "Enhanced-Constitution",
  },
  // {
  //   id: 71,
  //   name: "Last-Stand",
  //   category: "Health",
  //   type: "Health",
  //   target: "Self",
  //   description:
  //     "When you would die, instead survive with 1 HP, but take +2 damage from all attacks for 1 week.",
  //   duration: null,
  //   icon: "Superior-Vigor.png",
  //   gemstoneCost: 4,
  //   manaCost: null,
  //   healthCost: null,
  //   xpGiven: null,
  //   diceNotation: null,
  //   value: 1,
  //   parentAbility: "Superior-Constitution",
  // },
];

const mana: Ability[] = [
  {
    id: 5,
    name: "Arcane-Focus",
    category: "Mana",
    type: "DailyMana",
    target: "Self",
    description: "You gain 1 extra daily mana.",
    duration: null,
    icon: "Arcane-Focus.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: null,
  },
  {
    id: 6,
    name: "Arcane-Recovery",
    category: "Mana",
    type: "DailyMana",
    target: "Self",
    description: "You gain 1 extra daily mana.",
    duration: null,
    icon: "Arcane-Recovery.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: "Arcane-Focus",
  },
  {
    id: 7,
    name: "Arcane-Connection",
    category: "Mana",
    type: "DailyMana",
    target: "Self",
    description: "You gain 1 extra daily mana.",
    duration: null,
    icon: "Arcane-Connection.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: "Arcane-Recovery",
  },
];

const trickery: Ability[] = [
  {
    id: 8,
    name: "Evade",
    category: "Trickery",
    type: "Trickery",
    target: "Self",
    description:
      "You may evade the effects of today's cosmic event, in exchange for mana.",
    duration: 960, // 16 hours
    icon: "Evade.png",
    gemstoneCost: 1,
    manaCost: 6,
    healthCost: null,
    xpGiven: 40,
    diceNotation: null,
    value: null,
    parentAbility: null,
  },
  // Meant to be underpowered, but useful for certain events
  // Base: 40 XP / 6 Mana = 6.66
  // Duration penalty: -35% = 4.33
  // Final: 4.33 efficiency
  {
    id: 9,
    name: "Devilish-Deal",
    category: "Trickery",
    type: "Trickery",
    target: "Self",
    description:
      "You may evade the effects of today's cosmic event, in exchange for health.",
    duration: 960, // 16 hours
    icon: "Devilish-Deal.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: 12,
    xpGiven: 80,
    diceNotation: null,
    value: null,
    parentAbility: "Evade",
  },
  // Meant to be underpowered, but useful for certain events
  // Base: 80 XP / 12 HP = 6.66
  // Duration penalty: -35% = 4.33
  // Final: 4.33 efficiency
  {
    id: 10,
    name: "Twist-of-Fate",
    category: "Trickery",
    type: "Trickery",
    target: "Self",
    description:
      "Roll a d20. On a natural 20, today's event is rerolled. You may only use this ability once per day.",
    duration: 960, // 16 hours
    icon: "Twist-of-Fate.png",
    gemstoneCost: 2,
    manaCost: 8,
    healthCost: null,
    xpGiven: 200,
    diceNotation: "1d20",
    value: null,
    parentAbility: "Devilish-Deal",
  },
  // Base: 200 XP / 8 Mana = 25
  // Duration penalty: -35% = 16.25
  // Final: 16.25 efficiency
  {
    id: 11,
    name: "Postpone",
    category: "Trickery",
    type: "Postpone",
    target: "Self",
    description:
      "You appeal to the game master, and plead for 8 hours extended time on a task. (You must contact a game master and get extended time confirmation in Teams to use this ability.) Postpone abilities do not stack.",
    duration: 480, // 8 hours
    icon: "Postpone.png",
    gemstoneCost: 2,
    manaCost: 10,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: null,
    parentAbility: "Evade",
  },
  {
    id: 12,
    name: "Greater-Postpone",
    category: "Trickery",
    type: "Postpone",
    target: "Self",
    description:
      "You appeal to the game master, and plead for 24 hours extended time on a task. (You must contact a game master and get extended time confirmation in Teams to use this ability.) Postpone abilities do not stack.",
    duration: 1440, // 24 hours
    icon: "Greater-Postpone.png",
    gemstoneCost: 4,
    manaCost: 12,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: null,
    parentAbility: "Postpone",
  },
  {
    id: 13,
    name: "Superior-Postpone",
    category: "Trickery",
    type: "Postpone",
    target: "Self",
    description:
      "You appeal to the game master, and plead for 48 hours extended time on a task. (You must contact a game master and get extended time confirmation in Teams to use this ability.) Postpone abilities do not stack.",
    duration: 2880, // 48 hours
    icon: "Superior-Postpone.png",
    gemstoneCost: 4,
    manaCost: 15,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: null,
    parentAbility: "Greater-Postpone",
  },
];

const adventurer: Ability[] = [
  // {
  // id: 14
  //   name: "Adventurer",
  //   category: "Adventurer",
  //   type: "Adventurer",
  //   target: "Self",
  //   description: "Allows participation in the arena's games.",
  //   duration: null,
  //   icon: "Adventurer.png",
  //   gemstoneCost: 1,
  //   manaCost: 0,
  //   healthCost: null,
  //   xpGiven: 50,
  // diceNotation: null,
  //   value: null,
  //   parentAbility: null,
  // },
  // {
  // id:
  //   name: "Economist",
  //   category: "Adventurer",
  //   type: "Adventurer",
  //   target: "Self",
  //   description:
  //     "Every time you gain xp, you gain the same amount of gold. Gold can be spent in the shop.",
  //   duration: null,
  //   icon: "Economist.png",
  //   gemstoneCost: 1,
  //   manaCost: 0,
  //   healthCost: null,
  //   xpGiven: 50,
  // diceNotation: null,
  //   value: null,
  //   parentAbility: "Adventurer",
  //
  // },
];

const wizard: Ability[] = [
  {
    id: 16,
    name: "Arcane-Gift",
    category: "Wizard",
    type: "DailyMana",
    target: "Self",
    description: "Gain 1 extra daily mana.",
    duration: null,
    icon: "Arcane-Gift.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: null,
  },
  {
    id: 15,
    name: "Essence-Transfer",
    category: "Wizard",
    type: "Mana",
    target: "SingleTarget",
    description: "You channel your powers, giving a guildmember 1d6 mana.",
    duration: null,
    icon: "Essence-Transfer.png",
    gemstoneCost: 2,
    manaCost: 2,
    healthCost: null,
    xpGiven: 20,
    diceNotation: "1d6", // efficiency +1.5
    value: null,
    parentAbility: "Arcane-Gift",
  },
  // Base: 20 XP / 2 Mana = 10
  // No duration penalty
  // Final: 10 efficiency
  {
    id: 17,
    name: "Inner-Power",
    category: "Wizard",
    type: "DailyMana",
    target: "Self",
    description: "Gain 1 extra daily mana.",
    duration: null,
    icon: "Inner-Power.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: "Arcane-Gift",
  },
  {
    id: 21,
    name: "Arcane-Guidance",
    category: "Wizard",
    type: "DailyMana",
    target: "All",
    description:
      "You show your guildmates the secrets of the arcane. All members of the guild gain an additional 1 mana per day.",
    duration: null,
    icon: "Arcane-Guidance.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: "Inner-Power",
  },
  {
    id: 18,
    name: "Arcane-Reservoir",
    category: "Wizard",
    type: "DailyMana",
    target: "All",
    description:
      "You show your team even more secrets of the arcane. All members of the guild gain 1 additional mana per day.",
    duration: null,
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: "Arcane-Guidance",
  },
  {
    id: 19,
    name: "Greater-Essence-Transfer",
    category: "Wizard",
    type: "Mana",
    target: "SingleTarget",
    description: "You channel your powers, giving a guildmember 1d8 mana.",
    duration: null,
    icon: "Greater-Essence-Transfer.png",
    gemstoneCost: 4,
    manaCost: 3,
    healthCost: null,
    xpGiven: 40,
    diceNotation: "1d8+1", // efficiency +2
    value: null,
    parentAbility: "Essence-Transfer",
  },
  // Base: 40 XP / 3 Mana = 13.3
  // No duration penalty
  // Final: 13.3 efficiency
  {
    id: 20,
    name: "Cosmic-Gift",
    category: "Wizard",
    type: "Mana",
    target: "SingleTarget",
    description: "You channel your powers, giving a guildmember 2d6+2 mana.",
    duration: null,
    icon: "Cosmic-Gift.png",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 80,
    diceNotation: "2d6+2", // efficiency +3
    value: null,
    parentAbility: "Greater-Essence-Transfer",
  },
  // Base: 80 XP / 5 Mana = 16
  // No duration penalty
  // Final: 16 efficiency
  {
    id: 22,
    name: "Essence-Offering",
    category: "Wizard",
    type: "Mana",
    target: "Others",
    description: "You grant all your guildmembers 4 mana.",
    duration: null,
    icon: "Essence-Offering.png",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 120,
    diceNotation: null,
    value: 4, // guild benefit
    parentAbility: "Greater-Essence-Transfer",
  },
  // Base: 120 XP / 5 Mana = 24
  // No duration penalty
  // Final: 24 efficiency
  {
    id: 63,
    name: "Fireball",
    category: "Wizard",
    type: "DungeonAttack",
    target: "SingleTarget",
    description: "You attack an enemy with a fireball, dealing 1d10 damage.",
    duration: null,
    icon: "Fireball.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: "1d10",
    value: null,
    isDungeon: true,
    parentAbility: "Greater-Essence-Transfer",
  },
];

const druid: Ability[] = [
  {
    id: 69,
    name: "Blessings-of-the-Earth",
    category: "Druid",
    type: "IncreaseMana",
    target: "Self",
    description:
      "You prepare for the unforeseen, increasing your maximum mana by 5.",
    duration: null,
    icon: "Blessings-of-the-Earth.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 5,
    parentAbility: null,
  },
  {
    id: 23,
    name: "Heal",
    category: "Druid",
    type: "Heal",
    target: "SingleTarget",
    description: "Restores 1d4 health to a target.",
    duration: null,
    icon: "Heal.png",
    gemstoneCost: 2,
    manaCost: 2,
    healthCost: null,
    xpGiven: 20,
    diceNotation: "1d4", // efficiency +0.5
    value: null,
    parentAbility: "Blessings-of-the-Earth",
  },
  // Base: 20 XP / 2 Mana = 10
  // No duration penalty
  // Final: 10 efficiency
  {
    id: 24,
    name: "Greater-Heal",
    category: "Druid",
    type: "Heal",
    target: "SingleTarget",
    description: "Restores 1d6 health to a target.",
    duration: null,
    icon: "Greater-Heal.png",
    gemstoneCost: 4,
    manaCost: 3,
    healthCost: null,
    xpGiven: 40,
    diceNotation: "1d6+1", // efficiency +1.5
    value: null,
    parentAbility: "Heal",
  },
  // Base: 40 XP / 3 Mana = 13.3
  // No duration penalty
  // Final: 13.3 efficiency
  {
    id: 25,
    name: "Superior-Heal",
    category: "Druid",
    type: "Heal",
    target: "SingleTarget",
    description: "Restores 2d6 health to a target.",
    duration: null,
    icon: "Superior-Heal.png",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 80,
    diceNotation: "2d6", // efficiency +2
    value: null,
    parentAbility: "Greater-Heal",
  },
  // Base: 80 XP / 5 Mana = 16
  // No duration penalty
  // Final: 16 efficiency
  {
    id: 26,
    name: "Healing-Aura",
    category: "Druid",
    type: "Heal",
    target: "All",
    description:
      "Restores 1d4 health to all members of the guild. Yourself included.",
    duration: null,
    icon: "Healing-Aura.png",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 120,
    diceNotation: "1d4",
    value: null,
    parentAbility: "Greater-Heal",
  },
  // Base: 80 XP / 5 Mana = 16
  // No duration penalty
  // Final: 16 efficiency
  {
    id: 27,
    name: "Healing-Grace",
    category: "Druid",
    type: "Heal",
    target: "All",
    description:
      "Restores 2d4 health to all members of the guild. Yourself included.",
    duration: null,
    icon: "Healing-Grace.png",
    gemstoneCost: 4,
    manaCost: 8,
    healthCost: null,
    xpGiven: 160,
    diceNotation: "2d4",
    value: null,
    parentAbility: "Healing-Aura",
  },
  // Base: 160 XP / 8 Mana = 20
  // No duration penalty
  // Final: 20 efficiency
  // {
  // id: 28
  //   name: "Rejuvinate",
  //   category: "Druid",
  //   type: "Heal",
  //   target: "SingleTarget",
  //   description: "Restores 15hp to a guildmember.",
  //   duration: null,
  //   // icon: "Rejuvinate.png",
  //   gemstoneCost: 6,
  //   manaCost: 12,
  //   healthCost: null,
  //   xpGiven: 250,
  //   value: 100,
  //   parentAbility: "Superior-Heal",
  //
  // },
  {
    id: 29,
    name: "Revive",
    category: "Druid",
    type: "Revive",
    target: "SingleTarget",
    description:
      "Revives a target from death without side-effects. Must be done before a game master revives the target.",
    duration: null,
    icon: "Revive.png",
    gemstoneCost: 4,
    manaCost: 15,
    healthCost: null,
    xpGiven: 320,
    diceNotation: null,
    value: null,
    parentAbility: "Superior-Heal",
  },
  // Base: 320 XP / 15 Mana = 21.3
  // No duration penalty
  // Final: 21.3 efficiency
  {
    id: 64,
    name: "Thorns",
    category: "Druid",
    type: "DungeonAttack",
    target: "SingleTarget",
    description:
      "You attack an enemy with vines covered by thorns, dealing 1d10 damage.",
    duration: null,
    icon: "Thorns.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: "1d10", // avg. 5.5
    value: null,
    isDungeon: true,
    parentAbility: "Greater-Heal",
  },
];

const barbarian: Ability[] = [
  {
    id: 30,
    name: "Toughness",
    category: "Barbarian",
    type: "IncreaseHealth",
    target: "Self",
    description: "You gain 5 extra health.",
    duration: null,
    icon: "Toughness.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 5,
    parentAbility: null,
  },
  {
    id: 31,
    name: "Shield",
    category: "Barbarian",
    type: "Protection",
    target: "Self",
    description: "You shield yourself from 1d4 damage for the next 4 hours.",
    duration: 240, // 4 hours
    icon: "Shield.png",
    gemstoneCost: 2,
    manaCost: 2,
    healthCost: null,
    xpGiven: 40,
    diceNotation: "1d4", // efficiency +0.5
    value: null,
    parentAbility: "Toughness",
  },
  // Base: 40 XP / 2 Mana = 20
  // Duration penalty: -25% = 15
  // Final: 15 efficiency
  {
    id: 32,
    name: "Battle-Ready",
    category: "Barbarian",
    type: "Arena",
    target: "All",
    description:
      "You long for the thrill of battle, bringing your guildmates with you for another round in the arena.",
    duration: null,
    icon: "Battle-Ready.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: 6,
    xpGiven: 80,
    diceNotation: null,
    value: 1,
    parentAbility: "Toughness",
  },
  // Base: 80 XP / 6 HP = 13.3
  // No duration penalty
  // Final: 13.3 efficiency
  {
    id: 33,
    name: "Protector-of-the-Weak",
    category: "Barbarian",
    type: "Protection",
    target: "SingleTarget",
    description:
      "You shield the next attack on a guildmember from 1d6+1 damage for the next 4 hours.",
    duration: 240, // 4 hours
    icon: "Protector-of-the-Weak.png",
    gemstoneCost: 4,
    manaCost: 4,
    healthCost: null,
    xpGiven: 120,
    diceNotation: "1d6+1", // efficiency +1.5
    value: null,
    parentAbility: "Shield",
  },
  // Base: 120 XP / 4 Mana = 30
  // Duration penalty: -25% = 22.5
  // Final: 22.5 efficiency
  {
    id: 34,
    name: "Get-Behind-Me",
    category: "Barbarian",
    type: "Protection",
    target: "SingleTarget",
    description:
      "You shield the next attack on a guildmember from 2d6 damage for the next 16 hours.",
    duration: 960, // 16 hours
    icon: "Get-Behind-Me.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: 5,
    xpGiven: 120,
    diceNotation: "2d6", // efficiency +2
    value: null,
    parentAbility: "Protector-of-the-Weak",
  },
  // Base: 120 XP / 5 HP = 24
  // Duration penalty: -35% = 15.6
  // Final: 15.6 efficiency
  {
    id: 35,
    name: "Protector-of-the-People",
    category: "Barbarian",
    type: "Protection",
    target: "Others",
    description:
      "You shield your guildmembers from 1d6 damage for the next 4 hours.",
    duration: 240, // 4 hours
    icon: "Protector-of-the-People.png",
    gemstoneCost: 4,
    manaCost: 6,
    healthCost: null,
    xpGiven: 160,
    diceNotation: "1d6",
    value: null,
    parentAbility: "Protector-of-the-Weak",
  },
  // Base: 160 XP / 6 Mana = 26.6
  // Duration penalty: -25% = 19.95
  // Final: 19.95 efficiency
  {
    id: 36,
    name: "Enhanced-Toughness",
    category: "Barbarian",
    type: "IncreaseHealth",
    target: "Self",
    description: "You gain another 5 extra health.",
    duration: null,
    icon: "Enhanced-Toughness.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 5,
    parentAbility: "Toughness",
  },
  {
    id: 37,
    name: "Superior-Toughness",
    category: "Barbarian",
    type: "IncreaseHealth",
    target: "Self",
    description: "You gain another 5 extra health.",
    duration: null,
    icon: "Superior-Toughness.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 5,
    parentAbility: "Enhanced-Toughness",
  },
  {
    id: 65,
    name: "Raging-Attack",
    category: "Barbarian",
    type: "DungeonAttack",
    target: "SingleTarget",
    description:
      "You attack an enemy with a raging attack, dealing 1d10 damage.",
    duration: null,
    icon: "Raging-Attack.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: "1d10",
    value: null,
    isDungeon: true,
    parentAbility: "Superior-Toughness",
  },
];

const warlock: Ability[] = [
  {
    id: 70,
    name: "Crimson-Shield",
    category: "Warlock",
    type: "ManaShield",
    target: "Self",
    description:
      "You transform your mana into a crimson shield that absorbs 1 damage for every 3 damage you take.",
    duration: null,
    icon: "Crimson-Shield.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 3,
    parentAbility: null,
  },
  {
    id: 38,
    name: "Secrets-of-the-Crimson",
    category: "Warlock",
    type: "Health",
    target: "Self",
    description: "Every time you are healed, you gain 1 extra health.",
    duration: null,
    icon: "Secrets-of-the-Crimson.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: "Crimson-Shield",
  },
  {
    id: 39,
    name: "Crimson-Bond",
    category: "Warlock",
    type: "Transfer",
    target: "SingleTarget",
    description: "You may give 3 of your hp to another player.",
    duration: null,
    icon: "Crimson-Bond.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: 3,
    xpGiven: 40,
    diceNotation: null,
    value: 3,
    parentAbility: "Crimson-Shield",
  },
  // Base: 40 XP / 3 HP = 13.3
  // No duration penalty
  // Final: 13.3 efficiency
  {
    id: 40,
    name: "Crimson-Gift",
    category: "Warlock",
    type: "DecreaseHealth",
    target: "SingleTarget",
    description:
      "Lose 5 of your maximum health to grant 2 mana to a guild member. This ability can only be used once per day.",
    duration: 960, // 16 hours
    icon: "Crimson-Gift.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: 5,
    xpGiven: 120,
    diceNotation: null,
    value: 2,
    parentAbility: "Crimson-Shield",
  },
  // Base: 120 XP / 5 HP = 24.4
  // Duration penalty: -35% = 15.6
  // Final: 15.6 efficiency
  {
    id: 41,
    name: "Crimson-Shift",
    category: "Warlock",
    type: "Swap",
    target: "SingleTarget",
    description:
      "You may swap health with a guildmember. You must have more health than the guildmember. The health of either cannot exceed their max health. This ability can only be used once per day.",
    duration: 960, // 16 hours
    icon: "Crimson-Shift.png",
    gemstoneCost: 4,
    manaCost: 4,
    healthCost: null,
    xpGiven: 120,
    diceNotation: null,
    value: null,
    parentAbility: "Crimson-Bond",
  },
  // Base: 120 XP / 4 Mana = 30
  // Duration penalty: -35% = 19.5
  // Final: 19.5 efficiency
  {
    id: 42,
    name: "Gift-of-Life",
    category: "Warlock",
    type: "DecreaseHealth",
    target: "SingleTarget",
    description:
      "Lose 10 of your maximum health to grant 5 mana to a guild member.",
    duration: 180, // 3 hours
    icon: "Gift-of-Life.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: 10,
    xpGiven: 160,
    diceNotation: null,
    value: 5,
    parentAbility: "Crimson-Gift",
  },
  // Base: 160 XP / 10 HP = 16
  // Duration penalty: -10% = 14.4
  // Final: 14.4 efficiency
  {
    id: 43,
    name: "Crimson-Coin",
    category: "Warlock",
    type: "GoldPassive",
    target: "Self",
    description:
      "You curse the gold you earn from the arena, increasing it by 1d10 % for 1 day.",
    duration: 960, // 16 hours
    icon: "Crimson-Coin.png",
    gemstoneCost: 2,
    manaCost: 3,
    healthCost: null,
    xpGiven: 80,
    diceNotation: "1d10",
    value: null,
    parentAbility: "Secrets-of-the-Crimson",
  },
  // Base: 80 XP / 3 Mana = 26.67
  // Duration penalty: -35% = 17.33
  // Final: 17.33 efficiency
  {
    id: 44,
    name: "Cursed-Gold",
    category: "Warlock",
    type: "GoldPassive",
    target: "All",
    description:
      "You curse the gold earned from the arena for all guild members, increasing it by 3d10 % for 1 day.",
    duration: 960, // 16 hours
    icon: "Cursed-Gold.png",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 160,
    diceNotation: "3d10",
    value: null,
    parentAbility: "Crimson-Coin",
  },
  // Base: 160 XP / 5 Mana = 32
  // Duration penalty: -35% = 20.8
  // Final: 20.8 efficiency
  {
    id: 66,
    name: "Crimson-Blades",
    category: "Warlock",
    type: "DungeonAttack",
    target: "SingleTarget",
    description:
      "You attack an enemy with crimson blades, dealing 1d10 damage.",
    duration: null,
    icon: "Crimson-Blades.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: "1d10",
    isDungeon: true,
    value: null,
    parentAbility: "Crimson-Shift",
  },
];

const bard: Ability[] = [
  {
    id: 68,
    name: "An-Eye-for-Gold",
    category: "Bard",
    type: "GoldPassive",
    target: "Self",
    description:
      "Your trained bard eyes allows you to find 1 extra gold every time you gain 10 gold from the arena.",
    duration: null,
    icon: "An-Eye-for-Gold.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 10,
    parentAbility: null,
  },
  {
    id: 45,
    name: "Performance",
    category: "Bard",
    type: "Experience",
    target: "All",
    description:
      "You perform a song, temporarily increasing the experience gain for all guildmembers by 1d6 % for 1 hour.",
    duration: 60, // 1 hour
    icon: "Performance.png",
    gemstoneCost: 2,
    manaCost: 2,
    healthCost: null,
    xpGiven: 20,
    diceNotation: "1d6", // efficiency +1
    value: null,
    parentAbility: "An-Eye-for-Gold",
  },
  // Base: 20 XP / 2 Mana = 10
  // Duration penalty: -10% = 9
  // Final: 9 efficiency
  {
    id: 46,
    name: "Streets-of-Gold",
    category: "Bard",
    type: "Gold",
    target: "Self",
    description:
      "You display your many talents to the crowd, gaining 10d10 gold for yourself.",
    duration: null,
    icon: "Streets-of-Gold.png",
    gemstoneCost: 2,
    manaCost: 3,
    healthCost: null,
    xpGiven: 40,
    diceNotation: "10d10",
    value: null,
    parentAbility: "An-Eye-for-Gold",
  },
  // Base: 40 XP / 3 Mana = 13.3
  // No duration penalty
  // Final: 13.3 efficiency
  {
    id: 47,
    name: "Inspiration",
    category: "Bard",
    type: "IncreaseMana",
    target: "All",
    description:
      "You inspire your guildmembers with words of wisdom, giving the entire guild 5 extra max mana for 5 days.",
    duration: 7200, // 5 days
    icon: "Inspiration.png",
    gemstoneCost: 2,
    manaCost: 4,
    healthCost: null,
    xpGiven: 240,
    diceNotation: null,
    value: 5,
    parentAbility: "An-Eye-for-Gold",
  },
  // Base: 240 XP / 4 Mana = 60
  // Duration penalty: -75% = 15
  // Final: 15 efficiency
  {
    id: 48,
    name: "Greater-Inspiration",
    category: "Bard",
    type: "IncreaseMana",
    target: "All",
    description:
      "You inspire your guildmembers with great philosophy, giving the entire guild 5 extra max mana for 5 days.",
    duration: 7200, // 5 days
    icon: "Greater-Inspiration.png",
    gemstoneCost: 4,
    manaCost: 4,
    healthCost: null,
    xpGiven: 240,
    diceNotation: null,
    value: 5,
    parentAbility: "Inspiration",
  },
  // Base: 240 XP / 4 Mana = 60
  // Duration penalty: -75% = 15
  // Final: 15 efficiency
  {
    id: 49,
    name: "Feast-of-Heroes",
    category: "Bard",
    type: "IncreaseHealth",
    target: "All",
    description:
      "You bring forth a great feast, including magnificent food and drink - temporarily increasing the max health of all guildmembers by 5 for 2 days.",
    duration: 2880, // 2 days
    icon: "Feast-of-Heroes.png",
    gemstoneCost: 2,
    manaCost: 4,
    healthCost: null,
    xpGiven: 160,
    diceNotation: null,
    value: 5,
    parentAbility: "An-Eye-for-Gold",
  },
  // Base: 160 XP / 4 Mana = 40
  // Duration penalty: -50% = 20
  // Final: 20 efficiency
  {
    id: 50,
    name: "Heartfelt-Performance",
    category: "Bard",
    type: "Experience",
    target: "All",
    description:
      "You and your guildmembers perform a heartfelt song, increasing experience gained for all guildmembers for the day by 1d10 %.",
    duration: 960, // 16 hours
    icon: "Heartfelt-Performance.png",
    gemstoneCost: 4,
    manaCost: 4,
    healthCost: null,
    xpGiven: 80,
    diceNotation: "1d10", // efficiency +1.5
    value: null,
    parentAbility: "Performance",
  },
  // Base: 80 XP / 4 Mana = 20
  // Duration penalty: -35% = 13
  // Final: 13 efficiency
  {
    id: 51,
    name: "Tavern-Dance",
    category: "Bard",
    type: "Experience",
    target: "All",
    description:
      "You and your guildmembers perform an incredible dance, increasing experience gained for all guildmembers for the day by 2d10 %.",
    duration: 960, // 16 hours
    icon: "Tavern-Dance.png",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 120,
    diceNotation: "2d10", // efficiency +2.5
    value: null,
    parentAbility: "Heartfelt-Performance",
  },
  // Base: 120 XP / 5 Mana = 24
  // Duration penalty: -35% = 15.6
  // Final: 15.6 efficiency
  {
    id: 67,
    name: "Song-of-Inspiration",
    category: "Bard",
    type: "Turns",
    target: "All",
    description:
      "You inspire your guildmates with a song, giving them an extra turn in the Dungeon.",
    duration: null,
    icon: "Song-of-Inspiration.png",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 80,
    diceNotation: null,
    value: 1,
    parentAbility: "Inspiration",
  },
  // Base: 80 XP / 5 Mana = 16
  // No duration penalty
  // Final: 16 efficiency
  {
    id: 92,
    name: "Vicious-Mockery",
    category: "Bard",
    type: "DungeonAttack",
    target: "SingleTarget",
    description:
      "You viciously mock your enemy, dealing 1d10 damage to their pride.",
    duration: null,
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: "1d10",
    isDungeon: true,
    value: null,
    parentAbility: "Inspiration",
  },
];

const fighter: Ability[] = [
  {
    id: 78,
    name: "Stamina",
    category: "Fighter",
    type: "TurnPassive",
    target: "Self",
    description:
      "You gain 1 extra turn in the dungeon each day. (Requires ability: Courage)",
    duration: null,
    icon: "Test.jpg",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: null,
  },
  // {
  //   id: 79,
  //   name: "Distraction",
  //   category: "Fighter",
  //   type: "IncreaseDungeonDamage",
  //   target: "Self",
  //   description:
  //     "You distract the enemies, enabling a guildmember to increase their damage dealt by 50% for 1 hour.",
  //   duration: 60, // 1 hour
  // icon: "Test.jpg",
  //   gemstoneCost: 2,
  //   manaCost: 2,
  //   healthCost: null,
  //   xpGiven: 100,
  //   diceNotation: null,
  //   value: 50,
  //   parentAbility: "Stamina",
  // },
  {
    id: 80,
    name: "Heart-of-a-Warrior",
    category: "Fighter",
    type: "TurnPassive",
    target: "Self",
    description: "You gain another extra turn in the dungeon each day.",
    duration: null,
    icon: "Test.jpg",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: "Stamina",
  },
  // {
  //   id: 81,
  //   name: "Champion",
  //   category: "Fighter",
  //   type: "TurnPassive",
  //   target: "Self",
  //   description: "You gain another extra turn in the dungeon each day.",
  //   duration: null,
  //   icon: "Test.jpg",
  //   gemstoneCost: 4,
  //   manaCost: null,
  //   healthCost: null,
  //   xpGiven: null,
  //   diceNotation: null,
  //   value: 1,
  //   parentAbility: "Heart-of-a-Warrior",
  // },
  {
    id: 82,
    name: "Critical-Role",
    category: "Fighter",
    type: "Crit",
    target: "Self",
    description:
      "How do you want to do this? Roll a d20. On a natural 20 your attacks critically hit for the next hour, doubling the damage done",
    duration: 60, // 1 hour
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: 5,
    xpGiven: 40,
    diceNotation: "1d20",
    value: null,
    parentAbility: "Stamina",
  },
  // Base: 40 XP / 5 HP = 8
  // Duration penalty: -10% = 7.2
  // Final: 7.2 efficiency
  {
    id: 83,
    name: "Masterful-Strike",
    category: "Fighter",
    type: "DungeonAttack",
    target: "SingleTarget",
    description:
      "You strike with precision, dealing 1d10 damage to a single enemy.",
    duration: null,
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: "1d10",
    isDungeon: true,
    value: null,
    parentAbility: "Stamina",
  },
  {
    id: 84,
    name: "Loot-Goblin",
    category: "Fighter",
    type: "VictoryGold",
    target: "Self",
    description:
      "You have a keen eye for loot, gaining an extra 20% gold every time your guild wins a battle.",
    duration: null,
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 20,
    parentAbility: "Stamina",
  },
  {
    id: 85,
    name: "Surge-of-Power",
    category: "Fighter",
    type: "VictoryMana",
    target: "SingleTarget",
    description:
      "When your guild wins a battle, a guildmember of your choice gains 2 mana. The guildmember must be chosen before the enemy is killed.",
    duration: 960, // 16 hours
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: 3,
    healthCost: null,
    xpGiven: 80,
    diceNotation: null,
    value: 2,
    parentAbility: "Loot-Goblin",
  },
  // Base: 80 XP / 3 Mana = 26.6
  // Duration penalty: -35% = 16.9
  // Final: 16.9 efficiency
  {
    id: 86,
    name: "Did-Someone-Say-Loot",
    category: "Fighter",
    type: "VictoryGold",
    target: "All",
    description:
      "You share your loot-hoarding expertise with your guildmates, granting all guildmembers an extra 30% of gold every time your guild wins a battle.",
    duration: null,
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 30,
    parentAbility: "Loot-Goblin",
  },
  {
    id: 87,
    name: "Slice-And-Dice",
    category: "Fighter",
    type: "DungeonAttack",
    target: "SingleTarget",
    description:
      "You attack an enemy with a swift cut, slicing their health in half. Can only be done once per day.",
    duration: 960, // 16 hours
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 200,
    diceNotation: null,
    value: null,
    isDungeon: true,
    parentAbility: "Masterful-Strike",
  },
  // Base: 200 XP / 5 Mana = 40.0
  // Duration penalty: -35% = 26.0
  // Final: 26.0 efficiency
  {
    id: 88,
    name: "Victorious-Reward",
    category: "Fighter",
    type: "VictoryMana",
    target: "All",
    description: "When your guild wins a battle all members gains 2 mana.",
    duration: 960, // 16 hours
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 160,
    diceNotation: null,
    value: 1,
    parentAbility: "Surge-of-Power",
  },
  // Base: 160 XP / 5 Mana = 32
  // Duration penalty: -35% = 20.8
  // Final: 20.8.0 efficiency
  {
    id: 89,
    name: "Dungeon-Master",
    category: "Fighter",
    type: "Crit",
    target: "All",
    description:
      "Roll a d20. On a natural 20 all guildmembers critically hit for the next hour, doubling the damage done. Does not stack with Critical Role.",
    duration: 60, // 1 hour
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: 5,
    healthCost: null,
    xpGiven: 120,
    diceNotation: "1d20",
    value: null,
    parentAbility: "Critical-Role",
  },
  // Base: 120 XP / 5 Mana = 24
  // Duration penalty: -10% = 21.6
  // Final: 21.6 efficiency
  // {
  //   id: 90,
  //   name: "Advertising",
  //   category: "Fighter",
  //   type: "GuildLevel",
  //   target: "All",
  //   description:
  //     "Your guild is well-advertised for 5 days, increasing the guild's monetary rewards from battles by the guild's level.",
  //   duration: 7200, // 5 days
  // icon: "Test.jpg",
  //   gemstoneCost: 4,
  //   manaCost: null,
  //   healthCost: null,
  //   xpGiven: null,
  //   diceNotation: null,
  //   value: null,
  //   parentAbility: "Did-Someone-Say-Loot",
  // },
  {
    id: 91,
    name: "Spin-To-Win",
    category: "Fighter",
    type: "DungeonAttack",
    target: "All",
    description:
      "You spin through the battlefield, dealing 1d8 damage to all enemies.",
    duration: null,
    icon: "Test.jpg",
    gemstoneCost: 4,
    manaCost: 4,
    healthCost: null,
    xpGiven: 80,
    diceNotation: "1d8",
    isDungeon: true,
    value: null,
    parentAbility: "Masterful-Strike",
  },
  // 80 XP / 4 Mana = 20
  // No duration penalty
  // Final: 20 efficiency
];

const arena: Ability[] = [
  {
    id: 72,
    name: "Arena",
    category: "Arena",
    type: "Access",
    target: "Self",
    description:
      "Grants an entry ticket to the arena. To participate in the arena games, you must also buy a game.",
    duration: null,
    icon: "Arena.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: null,
    parentAbility: null,
  },
  {
    id: 73,
    name: "Fighting-spirit",
    category: "Arena",
    type: "ArenaToken",
    target: "Self",
    description: "Gain another daily arena token.",
    duration: null,
    icon: "Token.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: "Arena",
  },
  {
    id: 74,
    name: "Brawler",
    category: "Arena",
    type: "ArenaToken",
    target: "Self",
    description: "Gain another daily arena token.",
    duration: null,
    icon: "Token.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    parentAbility: "Fighting-spirit",
  },
  {
    id: 75,
    name: "TypeQuest",
    category: "Arena",
    type: "Access",
    target: "Self",
    description: "Gain access to the TypeQuest arena. Type as fast as you can!",
    duration: null,
    icon: "Game.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: null,
    parentAbility: "Arena",
  },
  {
    id: 76,
    name: "WordQuest",
    category: "Arena",
    type: "Access",
    target: "Self",
    description:
      "Gain access to the WordQuest arena. A difficult game of finding the words!",
    duration: null,
    icon: "Game.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: null,
    parentAbility: "Arena",
  },
  {
    id: 77,
    name: "BinaryJack",
    category: "Arena",
    type: "Access",
    target: "Self",
    description:
      "Gain access to BinaryJack. Stake your gold in a high risk binary version of Blackjack.",
    duration: null,
    icon: "Game.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: null,
    parentAbility: "TypeQuest",
  },
];

const dungeon: Ability[] = [
  {
    id: 52,
    name: "Courage",
    category: "Dungeon",
    type: "TurnPassive",
    target: "Self",
    description: "You muster up the courage to fight the guild's enemies!",
    duration: null,
    icon: "Courage.png",
    gemstoneCost: 1,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    isDungeon: false,
    value: 1,
    parentAbility: null,
  },
  {
    id: 53,
    name: "Second-Wind",
    category: "Dungeon",
    type: "TurnPassive",
    target: "Self",
    description:
      "You regain extra stamina to fight your enemies longer! You gain 1 extra turn.",
    duration: null,
    icon: "Second-Wind.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    isDungeon: false,
    value: 1,
    parentAbility: "Courage",
  },
  {
    id: 54,
    name: "Action-Surge",
    category: "Dungeon",
    type: "TurnPassive",
    target: "Self",
    description:
      "You push yourself beyond the normal limits, to fight your enemies for longer! You gain 1 extra turn.",
    duration: null,
    icon: "Action-Surge.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    isDungeon: false,
    value: 1,
    parentAbility: "Second-Wind",
  },
  {
    id: 55,
    name: "Weak-Attack",
    category: "Dungeon",
    type: "DungeonAttack",
    target: "SingleTarget",
    description: "You attack a target for 1d4 damage.",
    duration: null,
    icon: "Weak-Attack.png",
    gemstoneCost: 0,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: "1d4", // avg. 2.5
    isDungeon: true,
    value: null,
    parentAbility: "Courage",
  },
  {
    id: 56,
    name: "Great-Attack",
    category: "Dungeon",
    type: "DungeonAttack",
    target: "SingleTarget",
    description: "You use a great attack against an enemy dealing 1d6 damage.",
    duration: null,
    icon: "Great-Attack.png",
    gemstoneCost: 2,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: "1d6", // avg. 3.5
    isDungeon: true,
    value: null,
    parentAbility: "Weak-Attack",
  },
  {
    id: 57,
    name: "Fencing",
    category: "Dungeon",
    type: "DungeonAttack",
    target: "SingleTarget",
    description:
      "You use a fencing attack against an enemy dealing 1d8 damage.",
    duration: null,
    icon: "Fencing.png",
    gemstoneCost: 4,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: "1d8", // avg. 4.5
    isDungeon: true,
    value: null,
    parentAbility: "Great-Attack",
  },
];

const cosmic: Ability[] = [
  {
    id: 58,
    name: "Poor-Harvest",
    category: "Cosmic",
    type: "XP",
    target: "All",
    description: "Everyone gains 1 XP. Activates at 11:20.",
    duration: null,
    icon: "Cosmic.png",
    gemstoneCost: 0,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 1,
    purchaseable: false,
    cosmicEvent: ["Poor-Harvest"],
    parentAbility: null,
  },
  {
    id: 59,
    name: "Troubled-Waters",
    category: "Cosmic",
    type: "Damage",
    target: "All",
    description:
      "A storm is crashing down upon us. All take 5 damage. No healing may occur today. The storm is said to hit at 11:20.",
    duration: null,
    icon: "Cosmic.png",
    gemstoneCost: 0,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 5,
    purchaseable: false,
    cosmicEvent: ["Poor-Harvest"],
    parentAbility: null,
  },
  {
    id: 60,
    name: "Sacrificial-Lamb",
    category: "Cosmic",
    type: "XP",
    target: "Self",
    description:
      "You may sacrifice HP for XP today. For every 5 HP you sacrifice you gain 80 XP.",
    duration: null,
    icon: "Cosmic.png",
    gemstoneCost: 0,
    manaCost: null,
    healthCost: 5,
    xpGiven: 80,
    diceNotation: null,
    value: null,
    purchaseable: false,
    cosmicEvent: ["Sacrificial-Lamb"],
    parentAbility: null,
  },
  // Base: 80 XP / 5 HP = 16
  // No duration penalty
  // Final: 16 efficiency
  {
    id: 61,
    name: "Tiredness",
    category: "Cosmic",
    type: "Mana",
    target: "Self",
    description: "Everyone loses 10 mana. Activates at 11:20.",
    duration: null,
    icon: "Cosmic.png",
    gemstoneCost: 0,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: -10, // negative value
    purchaseable: false,
    cosmicEvent: ["Tiredness"],
    parentAbility: null,
  },
  {
    id: 62,
    name: "Good-vibes",
    category: "Cosmic",
    type: "XP",
    target: "All",
    description: "Everyone gains 100 XP. Activates at 11:20.",
    duration: null,
    icon: "Cosmic.png",
    gemstoneCost: 0,
    manaCost: null,
    healthCost: null,
    xpGiven: null,
    diceNotation: null,
    value: 100,
    purchaseable: false,
    cosmicEvent: ["Good-vibes"],
    parentAbility: null,
  },
];

const abilities = [
  ...health,
  ...mana,
  ...trickery,
  ...adventurer,
  ...wizard,
  ...druid,
  ...barbarian,
  ...warlock,
  ...bard,
  ...fighter,
  ...dungeon,
  ...arena,
  ...cosmic,
];
export default abilities;
