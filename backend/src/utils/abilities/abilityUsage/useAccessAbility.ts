import { $Enums, Ability, User } from "lib/db.js";
import { PrismaTransaction } from "types/prismaTransaction.js";
import { ServerActionResult } from "../../../types/serverActionResult.js";
import { ErrorMessage } from "../../../lib/error.js";
import { activatePassive } from "./activatePassive.js";

/**
 * Uses an ability that grants access to a feature or area.
 *
 * @param db - The Prisma transaction object.
 * @param castingUser - The user who is using the ability.
 * @param targetUsersIds - The IDs of the users who are the targets of the ability.
 * @param ability - The ability being used.
 * @returns A message indicating the result of the ability usage.
 */
export const useAccessAbility = async (
  db: PrismaTransaction,
  castingUser: User,
  targetUsersIds: string[],
  ability: Ability,
): Promise<ServerActionResult<{ message: string; diceRoll: string }>> => {
  await Promise.all(
    targetUsersIds.map(async (targetUserId) => {
      // validate access
      const userAccess = await db.user.findUnique({
        where: {
          id: targetUserId,
        },
        select: {
          access: true,
        },
      });

      // names are written with slug format, but enum is in camelCase
      const accessName = ability.name.replace(/-/g, "") as $Enums.Access;
      if (userAccess?.access.includes(accessName)) {
        throw new ErrorMessage("User already has access to this feature");
      }

      // apply ability effects
      await db.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          access: {
            push: accessName,
          },
        },
      });
    }),
  );

  await activatePassive(db, castingUser, targetUsersIds, ability);
  return {
    success: true,
    data: {
      message: "Granted access to " + ability.name.replace(/-/g, " ") + "!",
      diceRoll: "",
    },
  };
};
