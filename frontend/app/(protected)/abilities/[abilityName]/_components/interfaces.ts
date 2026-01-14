import { Ability, Rarity } from "@tillerquest/prisma/browser";

export interface GuildMember {
  title: string | null;
  image: string | null;
  id: string;
  username: string | null;
  hp: number;
  hpMax: number;
  mana: number;
  manaMax: number;
  titleRarity: Rarity | null;
}

export interface AbilityAndOwnershipResponse {
  ability: Ability;
  ownAbility: boolean;
  ownParentAbility: boolean;
}

export interface PurchaseAbilityResponse {
  message: string;
  ability: {
    name: string;
    gemstoneCost: number;
    activated: boolean;
  };
}
