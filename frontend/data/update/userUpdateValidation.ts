"use server";

import { auth } from "@/auth";
import { escapeHtml, newUserSchema } from "@/lib/newUserValidation";
import { getGuildmemberCount } from "../guilds/getGuilds";
import { z } from "zod";

export const validateUserUpdate = async (id: string, data: any) => {
  const session = await auth();
  if (session?.user.id !== id || session?.user.role !== "NEW") {
    throw new Error("Not authorized");
  }

  const validatedData = newUserSchema.safeParse(data);

  if (!validatedData.success) {
    throw new Error(
      validatedData.error.errors.map((e) => e.message).join(", "),
    );
  }

  // validate if the user guild is full
  const guildCount = await getGuildmemberCount(id, validatedData.data.guild);
  if (guildCount >= 5) {
    throw new Error("Guild is full");
  }

  // Sanitize inputs
  const sanitizedData = {
    username: escapeHtml(validatedData.data.username),
    name: escapeHtml(validatedData.data.name),
    lastname: escapeHtml(validatedData.data.lastname),
    playerClass: escapeHtml(validatedData.data.playerClass),
    guild: escapeHtml(validatedData.data.guild),
    schoolClass: escapeHtml(validatedData.data.schoolClass),
    publicHighscore: validatedData.data.publicHighscore,
  };

  return sanitizedData;
};
