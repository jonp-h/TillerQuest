import { $Enums } from "@prisma/client";

export interface RootAbilities {
  name: string;
  type: $Enums.AbilityType;
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
