"use server";

import { escapeHtml, updateGuildnameSchema } from "@/lib/validationUtils";
import { db } from "@/lib/db";
import { checkUserIdAndActiveAuth } from "@/lib/authUtils";

export const validateGuildNameUpdate = async (id: string, name: string) => {
  await checkUserIdAndActiveAuth(id);

  const validatedData = updateGuildnameSchema.safeParse({ name });

  if (!validatedData.success) {
    return validatedData.error.errors.map((e) => e.message).join(", ");
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
