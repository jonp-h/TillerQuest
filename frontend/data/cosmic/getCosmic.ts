"use server";

import { AuthorizationError, checkActiveUserAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getCosmic = async () => {
  try {
    await checkActiveUserAuth();

    const cosmic = await db.cosmicEvent.findFirst({
      where: {
        selected: true,
      },
    });
    return cosmic;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn("Unauthorized access attempt to get cosmic event");
      throw error;
    }
    logger.error("Unable to get cosmic event: ", error);
    throw new Error(
      "Unable to get cosmic event. Please inform a game master of this timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
