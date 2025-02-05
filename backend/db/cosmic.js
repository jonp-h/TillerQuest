const cosmic = [
  {
    name: "Poor-Harvest",
    description: "Everyone gains 1 XP",
    // presetDate: "",
    frequency: 10,
    automatic: true,
    blockAbilityType: null,
    triggerAtNoon: false,
    abilityName: "Poor-Harvest",
  },
  {
    name: "Troubled-Waters",
    description:
      "A storm is crashing down upon us. All take 5 damage. No healing may occur today.",
    // presetDate: "",
    frequency: 10,
    automatic: true,
    blockAbilityType: "Heal",
    triggerAtNoon: true,
    abilityName: "Troubled-Waters",
  },
];

const abilities = [...cosmic];
export default abilities;
