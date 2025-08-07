import { Ability } from "@prisma/client";

export interface AbilityGridProps {
  abilities: Ability[];
  onAbilityRoll?: (ability: Ability) => void;
  disabled?: boolean;
}
