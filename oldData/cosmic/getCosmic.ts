"use server";

import { AuthorizationError, validateActiveUserAuth } from "@/lib/authUtils";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { $Enums } from "@prisma/client";

export const getCosmic = async (schoolClass: $Enums.SchoolClass | null) => {
  try {
    await validateActiveUserAuth();

    let query: string;

    // If the schoolclass includes "IM", select for Vg1, else Vg2
    if (schoolClass && schoolClass.toString().includes("IM")) {
      query = "selectedForVg1";
    } else {
      query = "selectedForVg2";
    }

    const cosmic = await db.cosmicEvent.findFirst({
      where: {
        [query]: true,
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
