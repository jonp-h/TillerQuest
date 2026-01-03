import { PrismaTransaction } from "../../types/prismaTransaction.js";
import {
  minResurrectionHP,
  guildmemberResurrectionDamage,
} from "../../gameSettings.js";
import { getGuildmembersByGuildname } from "../guilds/getGuildMembers.js";
import { damageValidator } from "../abilities/abilityValidators.js";
import { addLog } from "../logs/addLog.js";

/**
 * Internal helper for resurrecting a user with optional effects
 * Damages guild members as part of the resurrection ritual
 */
export const resurrectUser = async (
  tx: PrismaTransaction,
  userId: string,
  effects: string[],
) => {
  const user = await tx.user.update({
    data: {
      hp: minResurrectionHP,
    },
    where: {
      id: userId,
    },
    select: { username: true, guildName: true },
  });

  if (user.guildName) {
    // Get all guild members and remove the resurrected user from the array
    const allMembers = await getGuildmembersByGuildname(user.guildName, tx);
    const guildMembers = allMembers.filter((member) => member.id !== userId);

    await Promise.all(
      guildMembers.map(async (member) => {
        const damageToTake = await damageValidator(
          tx,
          member.id,
          member.hp,
          guildmemberResurrectionDamage,
          member.class,
          minResurrectionHP,
        );

        await tx.userPassive.create({
          data: {
            userId: member.id,
            passiveName: "Sacrifice",
            icon: "Sacrifice.png",
            endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
            effectType: "Deathsave",
          },
        });

        await tx.user.update({
          where: {
            id: member.id,
          },
          data: {
            hp: { decrement: damageToTake },
          },
        });

        await addLog(
          tx,
          member.id,
          `${member.username} helped resurrect ${user.username}, and sacrificed ${damageToTake} HP in the ritual.`,
        );
      }),
    );
  }

  await Promise.all(
    // If the effect array is empty, none will be added
    effects.map(async (effect) => {
      if (effect === "Reduced-xp-gain") {
        await tx.userPassive.create({
          data: {
            userId: userId,
            passiveName: effect,
            icon: effect + ".png",
            endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
            effectType: "Experience",
            value: -50,
          },
        });
      } else {
        await tx.userPassive.create({
          data: {
            userId: userId,
            passiveName: effect,
            icon: effect + ".png",
            endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
            effectType: "Deathsave",
          },
        });
      }
      await addLog(
        tx,
        userId,
        `${user.username} was resurrected, but was affected by ${effect.replace(/-/g, " ")}.`,
      );
    }),
  );
};
