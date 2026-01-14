import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const adminRandomCosmic = [
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // const now = new Date();
      // const today = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

      await db.$transaction(async (tx) => {
        await tx.cosmicEvent.updateMany({
          where: {
            recommended: true,
          },
          data: {
            recommended: false,
          },
        });

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
        const events = await tx.cosmicEvent.findMany({
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
            (event.occurrencesVg1 + event.occurrencesVg2 + 1);
          return { event, weight };
        });

        // Normalize weights to sum up to 1
        const totalWeight = weights.reduce(
          (sum, { weight }) => sum + weight,
          0,
        );
        const normalizedWeights = weights.map(({ event, weight }) => ({
          event,
          weight: weight / totalWeight,
        }));

        // Select an event based on normalized weights
        let randomValue = Math.random();
        let cosmic = null;

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

        const chosenCosmic = await tx.cosmicEvent.update({
          where: {
            name: cosmic.name,
          },
          data: {
            recommended: true,
          },
        });

        return chosenCosmic;
      });

      res.json({ success: true, data: "Rerolled cosmic event" });
    } catch (error) {
      logger.error("Error generating random cosmic: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to generate random cosmic",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
