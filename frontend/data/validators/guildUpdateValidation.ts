"use server";

import { escapeHtml, updateGuildnameSchema } from "@/lib/validationUtils";
import { db } from "@/lib/db";
import { validateUserIdAndActiveUserAuth } from "@/lib/authUtils";
import { prettifyError } from "zod";

export const validateGuildNameUpdate = async (id: string, name: string) => {
  await validateUserIdAndActiveUserAuth(id);

  const validatedData = updateGuildnameSchema.safeParse({ name });

  if (!validatedData.success) {
    return prettifyError(validatedData.error);
  }

  const guildNameTaken = await db.guild.findFirst({
    where: {
      name: {
        equals: validatedData.data.name,
        mode: "insensitive",
      },
    },
  });

  if (guildNameTaken) {
    return "Try a different guild name";
  }

  // Sanitize inputs
  const sanitizedData = {
    name: escapeHtml(validatedData.data.name),
  };

  return sanitizedData;
};
