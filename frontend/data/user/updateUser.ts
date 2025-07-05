"use server";

import { db } from "@/lib/db";
import { AuthorizationError, checkUserIdAndActiveAuth } from "@/lib/authUtils";
import { logger } from "@/lib/logger";

export const updateProfile = async (
  id: string,
  data: { username: string; publicHighscore: boolean; archiveConsent: boolean },
) => {
  try {
    await checkUserIdAndActiveAuth(id);

    await db.user.update({
      where: { id },
      data: {
        username: data.username,
        publicHighscore: data.publicHighscore,
        archiveConsent: data.archiveConsent,
      },
    });
    return "Profile updated successfully";
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn(
        "Unauthorized access attempt to update user profile. " + error,
      );
      throw error;
    }

    logger.error("Error updating user profile: " + error);
    throw new Error(
      "Something went wrong while updating your profile. Please inform a game master of the following timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
