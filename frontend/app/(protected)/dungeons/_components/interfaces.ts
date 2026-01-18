import { Ability } from "@tillerquest/prisma/browser";

export interface AbilityGridProps {
  abilities: Ability[];
  onAbilityRoll?: (ability: Ability) => void;
  disabled?: boolean;
}
