import { db } from "../../lib/db.js";
import { SchoolClass } from "@tillerquest/prisma";
import { sendDiscordMessage } from "../../lib/discord.js";
import { PrismaTransaction } from "../../types/prismaTransaction.js";
import { getActiveUsersBySchoolGrade } from "utils/users/getActiveUsersBySchoolGrade.js";
import { ErrorMessage } from "lib/error.js";

/**
 * Helper function to set a cosmic event for a specific grade
 * Applies the cosmic event to all active users of that grade
 */
export const handleSetCosmic = async (
  cosmicName: string,
  grade: string,
  username: string,
  notify: boolean,
  tx: PrismaTransaction | typeof db = db,
) => {
  let query: string;
  let classList: SchoolClass[] = [];
  let occurrences: string;

  switch (grade) {
    case "vg1":
      query = "selectedForVg1";
      classList = ["Class_1IM1", "Class_1IM2", "Class_1IM3", "Class_1IM4"];
      occurrences = "occurrencesVg1";
      break;
    case "vg2":
      query = "selectedForVg2";
      classList = ["Class_2IT1", "Class_2IT2", "Class_2IT3", "Class_2MP1"];
      occurrences = "occurrencesVg2";
      break;
    default:
      throw new Error("Invalid grade");
  }

  const dailyCosmic = await tx.cosmicEvent.findFirst({
    where: {
      name: cosmicName,
      [query]: true,
    },
  });

  if (dailyCosmic) {
    throw new ErrorMessage("Cosmic event already selected");
  }

  await tx.cosmicEvent.updateMany({
    where: {
      [query]: true,
    },
    data: {
      [query]: false,
    },
  });

  // Remove all earlier cosmic passives and abilities
  await tx.userPassive.deleteMany({
    where: {
      user: {
        schoolClass: {
          in: classList,
        },
      },
      cosmicEvent: true,
    },
  });

  await tx.userAbility.deleteMany({
    where: {
      user: {
        schoolClass: {
          in: classList,
        },
      },
      fromCosmic: true,
    },
  });

  // Update cosmic with 1 occurrence and set it to selected
  const cosmic = await tx.cosmicEvent.update({
    where: {
      name: cosmicName,
    },
    data: {
      [occurrences]: {
        increment: 1,
      },
      [query]: true,
    },
  });

  // Add passive to all users of the chosen grade
  const users = await getActiveUsersBySchoolGrade(grade);

  for (const user of users) {
    if (cosmic.abilityName) {
      await tx.userPassive.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          passiveName: cosmic.name,
          effectType: "Cosmic",
          icon: cosmic.icon,
          cosmicEvent: true,
          ability: {
            connect: {
              name: cosmic.abilityName,
            },
          },
        },
      });

      if (cosmic.grantAbility) {
        await tx.userAbility.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            ability: {
              connect: {
                name: cosmic.abilityName,
              },
            },
            fromCosmic: true,
          },
        });
      }
    } else {
      await tx.userPassive.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          cosmicEvent: true,
          passiveName: cosmic.name,
          icon: cosmic.icon,
          effectType: cosmic.increaseCostType || "Cosmic",
          value: cosmic.increaseCostValue,
        },
      });
    }

    await tx.log.create({
      data: {
        userId: user.id,
        message: `COSMIC: Today's cosmic event is "${cosmic.name.replace(/-/g, " ")}"!`,
      },
    });
  }

  if (!cosmic) {
    throw new Error("Cosmic not found");
  }

  if (notify) {
    await sendDiscordMessage(
      username,
      `Today's cosmic event for ${grade} is "**${cosmic.name.replace(/-/g, " ")}**"!`,
      `${cosmic.description}`,
    );
  }
};
