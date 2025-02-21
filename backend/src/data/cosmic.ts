import { db } from "../lib/db.js";

export const randomCosmic = async () => {
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    return await db.$transaction(async (db) => {
      await db.cosmicEvent.updateMany({
        where: {
          OR: [{ recommended: true }, { selected: true }],
        },
        data: {
          recommended: false,
          selected: false,
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

      return cosmic;
    });
  } catch (error) {
    console.error("Unable to get random cosmic:", error);
    throw new Error("Unable to get random cosmic");
  }
};

export const setSelectedCosmic = async (cosmicName: string) => {
  try {
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
  } catch (error) {
    console.error("Unable to select cosmic:", error);
    throw new Error("Unable to select cosmic");
  }
};

export const getSelectedCosmic = async () => {
  try {
    const cosmic = await db.cosmicEvent.findFirst({
      where: {
        selected: true,
      },
    });

    if (!cosmic) {
      throw new Error("Cosmic not found");
    }
    return cosmic;
  } catch (error) {
    console.error("Error getting cosmic:", error);
    throw new Error("Unable to get cosmic");
  }
};
