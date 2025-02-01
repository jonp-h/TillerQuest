import { $Enums } from "@prisma/client";

export interface RootAbilities {
  name: string;
  icon: string;
  category: $Enums.AbilityCategory;
  children: {
    name: string;
    icon: string;
    children: {
      name: string;
      icon: string;
      children: {
        name: string;
        icon: string;
        children: {
          name: string;
          icon: string;
        }[];
      }[];
    }[];
  }[];
}

export interface UserAbilities {
  abilityName: string;
}
