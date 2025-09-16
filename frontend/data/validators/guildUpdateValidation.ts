"use server";

import { escapeHtml, updateGuildnameSchema } from "@/lib/validationUtils";
import { db } from "@/lib/db";
import { validateUserIdAndActiveUserAuth } from "@/lib/authUtils";
import { prettifyError } from "zod";
import { ServerActionResult } from "@/types/serverActionResult";

export const validateGuildNameUpdate = async (
  id: string,
  name: string,
): Promise<ServerActionResult> => {
  await validateUserIdAndActiveUserAuth(id);

  const validatedData = updateGuildnameSchema.safeParse({ name });

  if (!validatedData.success) {
    return { success: false, error: prettifyError(validatedData.error) };
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
    return { success: false, error: "Try a different guild name" };
  }

  // Sanitize inputs
  const sanitizedData = {
    name: escapeHtml(validatedData.data.name),
  };

  return { success: true, data: sanitizedData.name };
};
