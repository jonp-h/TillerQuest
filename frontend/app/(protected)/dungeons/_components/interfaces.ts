import { GuildEnemy, Ability } from "@prisma/client";

export interface GuildEnemyWithEnemy extends GuildEnemy {
  icon: string;
  maxHealth: number;
}

export interface AbilityGridProps {
  abilities: Ability[];
}
