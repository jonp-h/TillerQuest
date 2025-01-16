"use server";

import { db } from "@/lib/db";

// outdated code. updated in backend
export const randomCosmic = async () => {
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    return await db.$transaction(async (db) => {
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
        const weight = event.frequency / (event.occurrences + 1);
        return { event, weight };
      });

      // Calculate total weight
      const totalWeight = weights.reduce((sum, { weight }) => sum + weight, 0);

      // Select an event based on weights
      let randomValue = Math.random() * totalWeight;

      for (const { event, weight } of weights) {
        if (randomValue < weight) {
          return event;
        }
        randomValue -= weight;
      }

      // Fallback in case no event is selected (should not happen)
      return events[0];
    });
  } catch (error) {
    console.error("Unable to get random cosmic:", error);
    throw new Error("Unable to get random cosmic");
  }
};

export const setSelectedCosmic = async (cosmicName: string) => {
  try {
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

      // add selected passive or abilities to users

      if (!cosmic) {
        throw new Error("Cosmic not found");
      }

      return cosmic;
    });
  } catch (error) {
    console.error("Unable to select cosmic:", error);
    throw new Error("Unable to select cosmic");
  }
};

export const getAllCosmicEvents = async () => {
  const cosmicEvents = await db.cosmicEvent.findMany({
    orderBy: {
      selected: "desc",
    },
  });
  return cosmicEvents;
};
