import { GuildEnemy, Ability } from "@prisma/client";

export interface GuildEnemyWithEnemy extends GuildEnemy {
  id: string;
  icon: string;
  maxHealth: number;
}

export interface AbilityGridProps {
  abilities: Ability[];
  onAbilityRoll?: (ability: Ability) => void;
  disabled?: boolean;
}
