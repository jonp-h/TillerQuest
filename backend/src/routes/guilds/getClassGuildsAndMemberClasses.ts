import { Response } from "express";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";
import { AuthenticatedRequest } from "types/AuthenticatedRequest.js";
import { validateQuery } from "middleware/validationMiddleware.js";
import { schoolClassSchema } from "utils/validators/validationUtils.js";
import { SchoolClass } from "@tillerquest/prisma/browser";

// get guild member count of all guilds, excluding the current user in the count and only returning guilds that are not archived
export const getClassGuildsAndMemberClasses = [
  validateQuery(schoolClassSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schoolClass = req.query.schoolClass as string;
      const userId = req.session!.user.id;

      const settings = await db.applicationSettings.findFirst({
        where: {
          key: "SCHOOL_CLASS_RESTRICTION",
        },
      });

      const classGroups = await db.applicationSettings.findFirst({
        where: {
          key: "SCHOOL_CLASS_GROUPS",
        },
      });

      let classesToQuery: string[] = [];
      if (settings && settings.value === "CLASS_GROUPS" && classGroups) {
        // Parse class groups: "1IM1,1IM2;1IM3,1IM4"
        const groups = classGroups.value
          .split(";")
          .map((group) => group.split(","));

        // Find which group the schoolClass belongs to
        const matchingGroup = groups.find((group) =>
          group.includes(schoolClass.replace("Class_", "")),
        );

        // If found, convert back to enum format and use all classes in that group
        classesToQuery = matchingGroup
          ? matchingGroup.map((cls) => `Class_${cls}`)
          : [schoolClass];
      } else {
        // Default to only the user's school class
        classesToQuery = [schoolClass];
      }

      const guilds = await db.guild.findMany({
        where: {
          schoolClass: {
            in: classesToQuery as SchoolClass[],
          },
          archived: false,
        },
        select: {
          id: true,
          name: true,
          members: {
            select: {
              class: true,
            },
            where: {
              id: { not: userId },
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      });

      const guildMaxMembersSetting = await db.applicationSettings.findFirst({
        where: {
          key: "MAX_GUILD_MEMBERS",
        },
        select: {
          value: true,
        },
      });

      res.json({
        success: true,
        data: { guilds, maxMembers: guildMaxMembersSetting?.value || "6" },
      });
    } catch (error) {
      logger.error(
        "Error fetching guilds and member count by school class: " + error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to fetch guilds and member count by school class",
        timestamp: new Date().toISOString(),
      });
    }
  },
];
