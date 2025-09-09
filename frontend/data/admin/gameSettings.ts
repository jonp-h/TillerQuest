"use server";

import {
  validateAdminAuth,
  AuthorizationError,
  validateUserIdAuth,
} from "@/lib/authUtils";
import { db } from "@/lib/db";
import { ServerActionResult } from "@/types/serverActionResult";
import { logger } from "better-auth";

export const adminGetApplicationSettings = async (userId: string) => {
  try {
    await validateAdminAuth();
    await validateUserIdAuth(userId);

    const applicationSettings = await db.applicationSettings.findMany();

    return applicationSettings;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized admin access attempt to get application settings info",
      );
      throw error;
    }

    logger.error("Error fetching application settings info", error);
    throw new Error(
      "Failed to fetch application settings info. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};

export const adminUpdateApplicationSettings = async (
  userId: string,
  setting: { key: string; value: string },
): Promise<ServerActionResult> => {
  try {
    await validateAdminAuth();
    await validateUserIdAuth(userId);

    await db.applicationSettings.update({
      where: {
        key: setting.key,
      },
      data: {
        value: setting.value,
      },
    });

    return {
      success: true,
      data: "Successfully updated application setting: " + setting.key,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized admin access attempt to update application settings info",
      );
      return {
        success: false,
        error: error.message,
      };
    }

    logger.error("Error updating application settings info", error);
    return {
      success: false,
      error:
        "Failed to fetch application settings info. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    };
  }
};
