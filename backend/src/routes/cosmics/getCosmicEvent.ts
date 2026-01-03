import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middleware/authMiddleware.js";
import { ErrorMessage } from "lib/error.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { validateQuery } from "middleware/validationMiddleware.js";
import { schoolClassSchema } from "utils/validators/validationUtils.js";

export const getCosmicEvent = [
  requireAuth,
  requireActiveUser,
  validateQuery(schoolClassSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schoolClass = req.query.schoolClass as string | undefined;

      if (!schoolClass) {
        throw new ErrorMessage("schoolClass query parameter is required");
      }

      let query: string;

      // If the schoolclass includes "IM", select for Vg1, else Vg2
      if (schoolClass.includes("IM")) {
        query = "selectedForVg1";
      } else {
        query = "selectedForVg2";
      }

      const cosmic = await db.cosmicEvent.findFirst({
        where: {
          [query]: true,
        },
      });

      if (!cosmic) {
        res.status(404).json({
          success: false,
          error: "No cosmic event found",
        });
        return;
      }

      res.json({ success: true, data: cosmic });
    } catch (error) {
      if (error instanceof ErrorMessage) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Error fetching cosmic event: " + error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch cosmic event",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
