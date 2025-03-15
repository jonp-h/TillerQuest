const cosmic = [
  {
    name: "Poor-Harvest",
    description: "Everyone gains 1 XP",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: true,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: true,
    grantAbility: false,
    abilityName: "Poor-Harvest",
  },
  {
    name: "Troubled-Waters",
    description:
      "A storm is crashing down upon us. All take 5 damage. No healing may occur today (this cannot be avoided).",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: true,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: "Heal",
    triggerAtNoon: true,
    grantAbility: false,
    abilityName: "Troubled-Waters",
  },
  {
    name: "You-know-nothing-about-Snow",
    description: "If it is snowing outside, everyone gains 100 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Hot-like-a-furnace",
    description:
      "All students wearing outerwear jackets the first time this event is revealed, loses 5 hp.",
    // icon: ".png"
    // presetDate: "",
    frequency: 15,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Nei-nei-gutt",
    description:
      "All students wearing headwear the first time this event is revealed, loses 5 HP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 15,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Janteloven",
    description: "The player with the most XP in each guild loses 5 HP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Rock of Ages!",
    description:
      "All guilds must play rock paper scissors against eachother. The winner on each guild gains 100 XP and advances to a final round, where the winner (in each class) replenishes all HP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Winter-Is-Coming",
    description:
      "Summer children (born between 14.04 and 13.10) loses 5 HP. Winter children (born between 14.10 and 13.04) gains 100 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Shadowlands",
    description: "Lights must be turned off for the next seven minutes.",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Dangeorus-Raid",
    description:
      "Every student rolls a D6. Any student who rolls a 6, gains 100 XP and may heal up to 5 HP. Any student who rolls a 1, loses 7 HP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Sacrificial-Lamb",
    description:
      "You may sacrifice HP for XP today. For every 5 HP you sacrifice you gain 100 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 20,
    automatic: true,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: true,
    abilityName: "Sacrificial-Lamb",
  },
  {
    name: "Anger-from-the-beyond",
    description: "The Mana cost for all powers are doubled today.",
    // icon: ".png"
    // presetDate: "",
    frequency: 15,
    automatic: true,
    increaseCostType: "All",
    increaseCostValue: 100, // 100% increased cost
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Cosmic-Fury",
    description: "All damage today is doubled.",
    // icon: ".png"
    // presetDate: "",
    frequency: 20,
    automatic: true,
    increaseCostType: "Damage",
    increaseCostValue: 100, // 100% increased damage
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Sól-worship",
    description:
      "If it is sunny outside the first time this event is revealed, everyone gains 5 HP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Hope-in-a-hanging-thread",
    description:
      "A random student will challenge the class in Hangman. If the class fails to guess the word after 10 tries, the challenger gains 200 XP. If the class succeeds, the challenger gains none, and each other student gains 50 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Catch-up-day",
    description: "The three students in class with the least XP, gain 250 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 15,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Bard-song",
    description:
      "The bard in class with the most XP points may choose a song to be played for the whole class. Maximum length 8 minutes.",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Bard-showcase",
    description:
      "The bard in class with the most XP points may choose a technology/teaching-relevant video to be played for the whole class. Maximum length 8 minutes.",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Hammer-of-justice",
    description:
      "The first student in class to receive damage today, loses all Mana",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Happy-birthday",
    description:
      "The student in class with the most recent birthday gains 100 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 20,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Freezing-vibes",
    description:
      "Barbarians gain 10 XP for each degree below zero °C (according to last observation at nearest meteorological station at yr.no).",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Royal flush",
    description:
      "All students sharing a name with a former king of Norway, gain 100 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Collective-punishment",
    description:
      "Each time a student receives damage, all other students in class (with at least 5 HP) receives 2 damage.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Tears-of-the-kingdom",
    description:
      "If it's raining outside the first time this event is revealed, everyone loses 5 HP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 15,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Training",
    description: "Everyone gains double XP today.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: true,
    increaseCostType: "XP",
    increaseCostValue: 100, // 100% increased XP
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Efforts-of-Druids",
    description: "All Druids gain 150 XP",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Wise-Wizards",
    description: "All Wizards gain 150 XP",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Barbarian-power",
    description: "All Barbarians gain 150 XP",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Crimson-ritual",
    description: "All Bloodmages gain 150 XP",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Festival-of-music",
    description: "All Bards gain 150 XP",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Bad-hair-day",
    description: "Game masters without headwear cannot deal out damage today",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Tiredness",
    description: "Everyone loses 10 Mana",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: true,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: true,
    grantAbility: false,
    abilityName: "Tiredness",
  },
  {
    name: "Ride-of-the-Valkyries",
    description: "All female students gain 250 XP",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Powerful-healers",
    description: "The Mana cost for healing others is halved today.",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: true,
    increaseCostType: "Heal",
    increaseCostValue: -50, // 50% decreased cost
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Vigilance",
    description: "Anyone caught with eyes closed loses 15 HP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Leadership-privileges",
    description:
      "The student with most XP in each team may choose one of the following: 1. Gain 10 HP. 2. Gain 20 Mana. 3. Gain 100 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Preparing-for-battle",
    description:
      "Everyone is challenged to do push-ups. Anyone doing 10 push-ups in a row gets 100 XP. The student in class who does the most push-ups in a row, gets another 100 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 15,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Scurvy-prevention",
    description: "Anyone eating fruits or vegetables in today gains 200 XP",
    // icon: ".png"
    // presetDate: "",
    frequency: 15,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Abstainers-delight",
    description: "Everyone with maximum Mana gains 200 XP",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "The-gentlemen",
    description:
      "No one is allowed to speak for one hour after the event is revealed. All communication must be through body language or text. Anyone caught speaking will lose 20HP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Garbage-control",
    description:
      "The Game Masters will examine the hub for garbage. Everyone will lose 1 HP for each garbage item that's at an improper place. The procedure will be repeated at the end of the day",
    // icon: ".png"
    // presetDate: "",
    frequency: 20,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "But-can-your-chair-do-this",
    description:
      "The Game Masters will examine the chairs of the hub. Everyone will lose 1 HP for each chair that's not properly put up at the end of the day.",
    // icon: ".png"
    // presetDate: "",
    frequency: 20,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Clean-up",
    description:
      "Everyone is challenged to play Mine Sweeper and may choose either: Beginner level: 60 XP if completed within 60 seconds, 5 damage if a mine is hit. Intermediate level: 150 XP if completed within 300 seconds, 10 damage if a mine is hit. Everyone gets one attempt only, and must be supervised by a Game Master.",
    // icon: ".png"
    // presetDate: "",
    frequency: 5,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Good-vibes",
    description: "Good vibes spread through the class. Everyone gains 100 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Game-over",
    description: "No healing is allowed today. All damages are doubled.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: true,
    increaseCostType: "Damage",
    increaseCostValue: 100, // 100% increased damage
    blockAbilityType: "Heal",
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "A-dream-of-spring",
    description:
      "If the temperature outside is above 15 °C, everyone gains 200 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Visions-of-rainbows",
    description:
      "All students gain 25 XP for each distinct colour in their clothing.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Emergency-aid",
    description: "The guild in class with the lowest average HP gain 7 HP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Russian-Roulette",
    description:
      "Everyone may try their luck with a Russian Roulette by selecting a number from 1 to 6. Players on same team may not select same number. Roll a die, then resolve as follows: All players who selected the number that was rolled, die immediately. Surviving players gain XP equal to twice their current HP times the number of participating players on their team.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Reconnaissance",
    description:
      "The Game Masters chooses two students that shall take one lap around the school and report back the observations. Each of them gets a reward of 100 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Portrait-of-the-Game-Masters",
    description:
      "The Game Masters want a portrait of them to really capture their incredible power: All flattering drawings are subject to a 300 XP reward and wil be put up in the office. Best drawing is subject to an additional 300 XP reward. ",
    // icon: ".png"
    // presetDate: "",
    frequency: 20,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Quiet-in-the-realm",
    description: "Nothing happens",
    // icon: ".png"
    // presetDate: "",
    frequency: 20,
    automatic: true,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Pop-quiz",
    description:
      "The Game Masters will ask a few questions of different difficulty levels. The first student to answer correctly gains either 50, 100 or 150 XP based on the difficulty.",
    // icon: ".png"
    // presetDate: "",
    frequency: 20,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  {
    name: "Linux-lovers",
    description:
      "All students with a Linux-based operating system present on their computer gains 200 XP.",
    // icon: ".png"
    // presetDate: "",
    frequency: 10,
    automatic: false,
    increaseCostType: null,
    increaseCostValue: null,
    blockAbilityType: null,
    triggerAtNoon: false,
    grantAbility: false,
    abilityName: null,
  },
  // {
  //   name: "Friday-the-13th",
  //   description: "Each team must split 13 damage among the members. If the team fails to come to an agreement, each individual member gets 13 damage.",
  //   // icon: ".png"
  //   presetDate: "",
  //   frequency: 10,
  //   automatic: false,
  //   increaseCostType: null,
  //   increaseCostValue: null,
  //   blockAbilityType: null,
  //   triggerAtNoon: false,
  //   grantAbility: false,
  //   abilityName: null,
  // },
];
const cosmics = [...cosmic];
export default cosmics;
