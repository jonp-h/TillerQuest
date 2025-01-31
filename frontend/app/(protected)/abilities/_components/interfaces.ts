import { $Enums } from "@prisma/client";

export interface RootAbilities {
  name: string;
  category: $Enums.AbilityCategory;
  children: {
    name: string;
    children: {
      name: string;
      children: {
        name: string;
        children: {
          name: string;
        }[];
      }[];
    }[];
  }[];
}

export interface UserAbilities {
  abilityName: string;
}
