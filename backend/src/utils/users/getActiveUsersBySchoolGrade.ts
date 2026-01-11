import { SchoolClass } from "@tillerquest/prisma/browser";
import { db } from "../../lib/db.js";
import { logger } from "../../lib/logger.js";

/**
 * Get all active users by school grade (vg1 or vg2)
 */
export const getActiveUsersBySchoolGrade = async (
  schoolGrade: string,
): Promise<Array<{ id: string }>> => {
  try {
    let classList: SchoolClass[] = [];

    switch (schoolGrade) {
      case "vg1":
        classList = ["Class_1IM1", "Class_1IM2", "Class_1IM3", "Class_1IM4"];
        break;
      case "vg2":
        classList = ["Class_2IT1", "Class_2IT2", "Class_2IT3", "Class_2MP1"];
        break;
      default:
        throw new Error("Invalid school grade");
    }

    const users = await db.user.findMany({
      where: {
        schoolClass: {
          in: classList,
        },
        role: {
          // FIXME: add new role
          notIn: ["NEW", "ARCHIVED"],
        },
      },
      select: {
        id: true,
      },
    });

    return users;
  } catch (error) {
    logger.error("Error fetching active users by school grade: " + error);
    throw new Error(
      "Failed to fetch active users by school grade. Error timestamp: " +
        Date.now().toLocaleString("no-NO"),
    );
  }
};
