"use server";

import { db } from "@/lib/db";
import {
  AuthorizationError,
  checkNewUserAuth,
  checkUserIdAndActiveAuth,
  checkUserIdAuth,
} from "@/lib/authUtils";
import { logger } from "@/lib/logger";
import { ErrorMessage } from "@/lib/error";
import { $Enums } from "@prisma/client";
import { validateUserCreation } from "../validators/userUpdateValidation";
import { checkNewUserSecret } from "../validators/secretValidation";

interface UpdateUserProps {
  secret: string;
  username: string;
  name: string;
  lastname: string;
  class: $Enums.Class;
  image: string;
  guildName: string;
  schoolClass: $Enums.SchoolClass;
  publicHighscore: boolean;
}

// used on account creation page
export const updateUser = async (id: string, data: UpdateUserProps) => {
  try {
    await checkUserIdAuth(id);
    await checkNewUserAuth();

    // backend validation
    if (!(await checkNewUserSecret(id, data.secret))) {
      return false;
    }

    const formValues = {
      username: data.username,
      name: data.name,
      lastname: data.lastname,
      playerClass: data.class,
      guild: data.guildName,
      schoolClass: data.schoolClass,
      publicHighscore: data.publicHighscore,
    };

    // backend validation
    const validatedData = await validateUserCreation(id, formValues);

    if (typeof validatedData == "string") {
      throw new ErrorMessage(validatedData);
    }

    await db.user.update({
      where: { id },
      data: {
        role: "USER",
        username: validatedData.username,
        name: validatedData.name,
        lastname: validatedData.lastname,
        class: validatedData.playerClass.slice(0, -1) as $Enums.Class,
        image: validatedData.playerClass,
        guildName: validatedData.guild,
        schoolClass: validatedData.schoolClass as $Enums.SchoolClass,
        publicHighscore: validatedData.publicHighscore,
        lastMana: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    });
    return true;
  } catch (error) {
    if (error instanceof ErrorMessage) {
      console.warn("Error updating user: " + error.message);
      throw error;
    }

    console.error("Error updating user: " + error);

    return false;
  }
};

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
