import { $Enums } from "@prisma/client";
import { RawNodeDatum } from "react-d3-tree";

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
  ability: {
    name: string;
    icon: string | null;
  };
}

export interface ExtendedRawNodeDatum extends RawNodeDatum {
  icon: string;
}
