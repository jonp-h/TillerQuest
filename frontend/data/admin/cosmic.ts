"use server";

import { db } from "@/lib/db";
import { getActiveUsersBySchoolGrade } from "./adminUserInteractions";
import { AuthorizationError, validateAdminAuth } from "@/lib/authUtils";
import { logger } from "@/lib/logger";
import { ErrorMessage } from "@/lib/error";
import { ServerActionResult } from "@/types/serverActionResult";
import { CosmicEvent, SchoolClass } from "@prisma/client";

export const randomCosmic = async (): Promise<
  ServerActionResult<CosmicEvent>
> => {
  try {
    await validateAdminAuth();
    // const now = new Date();
    // const today = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    return await db.$transaction(async (db) => {
      await db.cosmicEvent.updateMany({
        where: {
          recommended: true,
        },
        data: {
          recommended: false,
        },
      });

      let cosmic;
      //TODO: Implement preset events
      // Check for events with date equal to the current date
      // const presetEvents = await db.cosmicEvent.findFirst({
      //   where: {
      //     presetDate: today,
      //   },
      // });

      // if (presetEvents) {
      //   return presetEvents;
      // }

      // Get all events
      const events = await db.cosmicEvent.findMany({
        select: {
          name: true,
          frequency: true,
          occurrencesVg1: true,
          occurrencesVg2: true,
        },
      });

      if (events.length === 0) {
        throw new Error("No events available");
      }

      // Calculate weights based on frequency and occurrences
      const weights = events.map((event) => {
        const weight =
          event.frequency /
          100 /
          (event.occurrencesVg1 + event.occurrencesVg2 + 1); //TODO: adjust for vg1/vg2
        return { event, weight };
      });

      // Normalize weights to sum up to 1
      const totalWeight = weights.reduce((sum, { weight }) => sum + weight, 0);
      const normalizedWeights = weights.map(({ event, weight }) => ({
        event,
        weight: weight / totalWeight,
      }));

      // Select an event based on normalized weights
      let randomValue = Math.random();

      for (const { event, weight } of normalizedWeights) {
        if (randomValue < weight) {
          cosmic = event;
          break;
        }
        randomValue -= weight;
      }

      // Fallback in case no event is selected (should not happen)
      if (!cosmic) {
        cosmic = events[0];
      }

      const chosenCosmic = await db.cosmicEvent.update({
        where: {
          name: cosmic.name,
        },
        data: {
          recommended: true,
        },
      });

      return {
        success: true,
        data: chosenCosmic,
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get random cosmic");
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Unable to get random cosmic: ", error);
    return {
      success: false,
      error:
        "Unable to get random cosmic. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const setSelectedCosmic = async (
  cosmicName: string,
  grade: string,
): Promise<ServerActionResult> => {
  try {
    const session = await validateAdminAuth();

    return await db.$transaction(async (db) => {
      await handleSetCosmic(cosmicName, grade);

      await db.log.create({
        data: {
          userId: session.user.id || "",
          message: `GM ${session.user.username} has selected the cosmic event "${cosmicName.replace(/-/g, " ")}"`,
        },
      });

      return {
        success: true,
        data: `Successfully set ${cosmicName.replace(/-/g, " ")} as daily cosmic for ${grade}!`,
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to select cosmic");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Unable to select cosmic: ", error);
    return {
      success: false,
      error:
        "Unable to select cosmic. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

const handleSetCosmic = async (cosmicName: string, grade: string) => {
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

  const dailyCosmic = await db.cosmicEvent.findFirst({
    where: {
      name: cosmicName,
      [query]: true,
    },
  });

  if (dailyCosmic) {
    throw new ErrorMessage("Cosmic event already selected");
  }

  // Unselect all vg2 events
  await db.cosmicEvent.updateMany({
    where: {
      [query]: true,
    },
    data: {
      [query]: false,
    },
  });

  // Remove all earlier cosmic passives and abilities
  await db.userPassive.deleteMany({
    where: {
      user: {
        schoolClass: {
          in: classList,
        },
      },
      cosmicEvent: true,
    },
  });

  await db.userAbility.deleteMany({
    where: {
      user: {
        schoolClass: {
          in: classList,
        },
      },
      fromCosmic: true,
    },
  });

  // update cosmic with 1 occurrence and set it to selected
  const cosmic = await db.cosmicEvent.update({
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

  // add passive to all users of the chosen grade
  const users = await getActiveUsersBySchoolGrade(grade);

  for (const user of users) {
    if (cosmic.abilityName) {
      await db.userPassive.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          passiveName: cosmic.name,
          effectType: "Cosmic", // should be cosmic when there is no effect (manual)
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
        await db.userAbility.create({
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
      await db.userPassive.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          cosmicEvent: true,
          passiveName: cosmic.name,
          icon: cosmic.icon,
          effectType: cosmic.increaseCostType || "Cosmic", // should be cosmic when there is no effect (manual)
          value: cosmic.increaseCostValue,
        },
      });
    }
    await db.log.create({
      data: {
        userId: user.id,
        message: `COSMIC: Today's cosmic event is "${cosmic.name.replace(/-/g, " ")}"!`,
      },
    });
  }

  if (!cosmic) {
    throw new Error("Cosmic not found");
  }
};

export const setRecommendedCosmic = async (
  cosmicName: string,
): Promise<ServerActionResult> => {
  try {
    const session = await validateAdminAuth();

    return await db.$transaction(async (db) => {
      await db.cosmicEvent.updateMany({
        where: {
          recommended: true,
        },
        data: {
          recommended: false,
        },
      });

      await db.cosmicEvent.update({
        where: {
          name: cosmicName,
        },
        data: {
          recommended: true,
        },
      });

      await db.log.create({
        data: {
          userId: session.user.id || "",
          message: `GM ${session.user.username} has selected the cosmic event "${cosmicName.replace(/-/g, " ")}"`,
        },
      });

      return {
        success: true,
        data: `Successfully changed the recommended cosmic to ${cosmicName.replace(/-/g, " ")}`,
      };
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to recommend cosmic");
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ErrorMessage) {
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Unable to recommend cosmic: ", error);
    return {
      success: false,
      error:
        "Unable to recommend cosmic. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};

export const getAllCosmicEvents = async () => {
  try {
    await validateAdminAuth();

    const cosmicEvents = await db.cosmicEvent.findMany({
      orderBy: [{ selectedForVg1: "desc" }, { selectedForVg2: "desc" }],
    });
    return cosmicEvents;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized admin access attempt to get cosmic events");
      throw error;
    }

    logger.error("Unable to get cosmic events: ", error);
    throw new Error(
      "Unable to get cosmic events. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const getRecommendedCosmicEvent =
  async (): Promise<CosmicEvent | null> => {
    try {
      await validateAdminAuth();

      const recommendedCosmic = await db.cosmicEvent.findFirst({
        where: {
          recommended: true,
        },
      });

      return recommendedCosmic;
    } catch (error) {
      if (error instanceof AuthorizationError) {
        logger.warn(
          "Unauthorized admin access attempt to get recommended cosmic event",
        );
        throw error;
      }

      logger.error("Unable to get recommended cosmic event: ", error);
      throw new Error(
        "Unable to get recommended cosmic event. Error timestamp: " +
          Date.now().toLocaleString("no-NO"),
      );
    }
  };

export const getSelectedCosmicEvents = async (): Promise<{
  vg1: CosmicEvent | null;
  vg2: CosmicEvent | null;
}> => {
  try {
    await validateAdminAuth();

    const [vg1, vg2] = await Promise.all([
      db.cosmicEvent.findFirst({
        where: {
          selectedForVg1: true,
        },
      }),
      db.cosmicEvent.findFirst({
        where: {
          selectedForVg2: true,
        },
      }),
    ]);

    return { vg1, vg2 };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized admin access attempt to get selected cosmic events",
      );
      throw error;
    }

    logger.error("Unable to get selected cosmic events: ", error);
    throw new Error(
      "Unable to get selected cosmic events. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
