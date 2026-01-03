import { Ability } from "lib/db.js";
import { DiceRoll, exportFormats } from "@dice-roller/rpg-dice-roller";

/**
 * Calculates the value of an ability for a user.
 *
 * @param ability - The ability being used.
 * @returns An object containing the total value of the ability.
 *
 * @remarks
 * - If the ability has a static value, that value is returned.
 * - If the ability has a dice notation, the value is calculated based on the dice roll.
 * - If the ability does not have a value or dice notation, a total value of 0 is returned.
 */
export const getAbilityValue = (ability: Ability) => {
  // if an ability has a static value, return it.
  if (ability.value) {
    return { total: ability.value };
  }

  if (!ability.diceNotation) {
    return { total: 0 };
  }
  const roll = new DiceRoll(ability.diceNotation);
  // @ts-expect-error - the package's export function is not typed correctly
  return roll.export(exportFormats.OBJECT) as {
    averageTotal: number;
    maxTotal: number;
    minTotal: number;
    notation: string;
    output: string;
    rolls: unknown[];
    total: number;
    type: string;
  };
};
