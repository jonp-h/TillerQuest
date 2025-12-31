import { $Enums } from "@prisma/client";
import { z } from "zod";

const entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

export function escapeHtml(string: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return String(string).replace(/[&<>"'`=\/]/g, function (s: any) {
    // @ts-expect-error - TS doesn't know entityMap
    return entityMap[s];
  });
}

export const newUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be above 3 characters")
    .max(20, "Username must be below 20 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Username may only contain latin letters, numbers, - and _",
    ),
  name: z
    .string()
    .min(3, "Given name must be above 3 characters")
    .max(20, "Given name must be below 20 characters")
    .regex(/^[A-Za-zŽžÀ-ÿ\s'-]+$/, "Given name may only contain letters"),
  lastname: z
    .string()
    .min(3, "Lastname must be above 3 characters")
    .max(20, "Lastname must be below 20 characters")
    .regex(/^[A-Za-zŽžÀ-ÿ\s'-]+$/, "Lastname may only contain letters"),
  playerClass: z.string(),
  guildId: z.number(),
  schoolClass: z.enum($Enums.SchoolClass, "Invalid school class"),
  publicHighscore: z.boolean(),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be above 3 characters")
    .max(20, "Username must be below 20 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Username may only contain latin letters, numbers, - and _",
    ),
  publicHighscore: z.boolean(),
  archiveConsent: z.boolean(),
});

export const updateGuildnameSchema = z.object({
  name: z
    .string()
    .min(3, "Guild name must be above 3 characters")
    .max(25, "Guild name must be below 25 characters")
    .regex(/^[A-Za-zŽžÀ-ÿ\s'-]+$/, "Guild name may only contain letters"),
});

export const adminReasonSchema = z.object({
  reason: z.string().max(40, "Reason must be below 40 characters"),
});
