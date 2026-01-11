import {
  Access,
  Class,
  SchoolClass,
  UserRole,
} from "@tillerquest/prisma/browser";
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

export const updateUserSchema = z.object({
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
  playerClass: z.enum(Class, "Invalid class"),
  guildId: z.number().positive("Guild ID must be a positive number"),
  image: z.string().min(1),
  schoolClass: z.enum(SchoolClass, "Invalid school class"),
  publicHighscore: z.boolean(),
  secret: z.string().min(1, "Secret is required"),
});

export const updateUserSettingsSchema = z.object({
  newUsername: z
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

export const updateUserRoleSchema = z.object({
  role: z.enum(UserRole),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  lastname: z.string().nullable().optional(),
  special: z.array(z.string()).optional(),
  access: z.array(z.enum(Access)).optional(),
});

export const updateApplicationSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1).max(1000),
});

export const guildNameParamSchema = z.object({
  guildName: z
    .string()
    .min(3, "Guild name must be above 3 characters")
    .max(25, "Guild name must be below 25 characters")
    .regex(
      /^[A-Za-zŽžÀ-ÿ0-9\s'_-]+$/,
      "Guild name may only contain letters, numbers, spaces, hyphens, underscores, and apostrophes",
    ),
});

export const schoolClassSchema = z.object({
  schoolClass: z.enum(SchoolClass, "Invalid school class"),
});

export const selectCosmicSchema = z.object({
  grade: z.enum(["vg1", "vg2"]),
  notify: z.boolean(),
});

export const cosmicNameSchema = z.object({
  cosmicName: z.string().min(1).max(40),
});

export const scheduleWishSchema = z.object({
  scheduledDate: z.coerce
    .date()
    .min(new Date(), "Schedule date must be in the future"),
});

export const abilityNameSchema = z.object({
  abilityName: z.string().min(1).max(100),
});

export const resurrectUserSchema = z.object({
  effect: z.enum([
    "free",
    "criticalMiss",
    "phone",
    "xp",
    "hat",
    "quiz",
    "criticalHit",
  ]),
});

export const adminReasonSchema = z.object({
  reason: z.string().max(40, "Reason must be below 40 characters"),
});

export const userIdParamSchema = z.object({
  userId: z.string().regex(/^[a-zA-Z0-9]{32}$/, "Invalid user ID format"),
});

export const userIdListSchema = z.object({
  userIds: z.array(
    z.string().regex(/^[a-zA-Z0-9]{32}$/, "Invalid user ID format"),
  ),
});

export const usernameParamSchema = z.object({
  username: z.string().min(3).max(20),
});

export const voteForWishSchema = z.object({
  wishId: z.number().int().positive("Wish ID must be a positive integer"),
  amount: z
    .number()
    .int()
    .positive("Amount must be greater than zero")
    .max(100000, "Amount must not exceed 100000 gold"),
  anonymous: z.boolean().default(false),
});

export const purchaseItemSchema = z.object({
  itemId: z.number().int().positive("Id must be greater than zero"),
});

export const purchaseAbilitySchema = z.object({
  abilityName: z.string().min(1).max(100),
});

export const equipItemSchema = z.object({
  itemId: z.number().int().positive("Id must be greater than zero"),
});

export const checkIfUserOwnsAbilitySchema = z.object({
  userId: z.cuid(),
  abilityName: z.string().min(1, "Ability name is required"),
});

export const idParamSchema = (idName = "id") =>
  z.object({
    [idName]: z.coerce.number("ID must be a number").int().positive(),
  });

export const updateGameSchema = z.object({
  data: z.array(z.number()),
  mistakes: z.number().optional(),
});

export const gameIdParamSchema = z.object({
  gameId: z.cuid(),
});

export const gameNameSchema = z.object({
  gameName: z.enum(
    ["TypeQuest", "WordQuest", "BinaryJack"],
    "Invalid game name",
  ),
});

export const initializeBinaryJackSchema = z.object({
  stake: z.number().int().positive(),
});

export const wordQuestHintSchema = z.object({
  word: z.string().min(1),
});

export const applyBinaryOperationSchema = z.object({
  operation: z.enum(["AND", "OR", "XOR", "NAND", "NOR", "XNOR"]),
});
