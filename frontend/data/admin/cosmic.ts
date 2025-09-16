"use server";

import { db } from "@/lib/db";
import { getAllActiveUsers } from "./adminUserInteractions";
import { AuthorizationError, validateAdminAuth } from "@/lib/authUtils";
import { logger } from "@/lib/logger";
import { ErrorMessage } from "@/lib/error";
import { ServerActionResult } from "@/types/serverActionResult";
import { CosmicEvent } from "@prisma/client";

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
      const events = await db.cosmicEvent.findMany();

      if (events.length === 0) {
        throw new Error("No events available");
      }

      // Calculate weights based on frequency and occurrences
      const weights = events.map((event) => {
        const weight = event.frequency / 100 / (event.occurrences + 1);
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

      await db.cosmicEvent.update({
        where: {
          name: cosmic.name,
        },
        data: {
          recommended: true,
        },
      });

      return {
        success: true,
        data: cosmic,
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
): Promise<ServerActionResult> => {
  try {
    const session = await validateAdminAuth();

    const dailyCosmic = await db.cosmicEvent.findFirst({
      where: {
        name: cosmicName,
        selected: true,
      },
    });
    if (dailyCosmic) {
      throw new ErrorMessage("Cosmic event already selected");
    }

    return await db.$transaction(async (db) => {
      // Unselect all events
      await db.cosmicEvent.updateMany({
        where: {
          selected: true,
        },
        data: {
          selected: false,
        },
      });

      // Remove all earlier cosmic passives and abilities
      await db.userPassive.deleteMany({
        where: {
          cosmicEvent: true,
        },
      });

      await db.userAbility.deleteMany({
        where: {
          fromCosmic: true,
        },
      });

      // update cosmic with 1 occurrence and set it to selected
      const cosmic = await db.cosmicEvent.update({
        where: {
          name: cosmicName,
        },
        data: {
          occurrences: {
            increment: 1,
          },
          selected: true,
        },
      });

      // add passives to all users
      const users = await getAllActiveUsers();

      for (const user of users) {
        // user should recieve a passive with a ticking bomb, and it should enable itself at 11:40
        // evade shold remove passive at a great mana cost

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

      await db.log.create({
        data: {
          userId: session.user.id || "",
          message: `GM ${session.user.username} has selected the cosmic event "${cosmic.name.replace(/-/g, " ")}"`,
        },
      });
      return {
        success: true,
        data: `Successfully set ${cosmic.name.replace(/-/g, " ")} as daily cosmic!`,
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

export const getAllCosmicEvents = async () => {
  try {
    await validateAdminAuth();

    const cosmicEvents = await db.cosmicEvent.findMany({
      orderBy: {
        selected: "desc",
      },
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
