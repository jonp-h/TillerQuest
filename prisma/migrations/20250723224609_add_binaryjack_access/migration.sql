/*
  Warnings:

  - The values [DiceCorner] on the enum `Access` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Access_new" AS ENUM ('Shop', 'Arena', 'Dungeons', 'GuildLeader', 'TypeQuest', 'WordQuest', 'BinaryJack', 'WIP');
ALTER TABLE "User" ALTER COLUMN "access" TYPE "Access_new"[] USING ("access"::text::"Access_new"[]);
ALTER TYPE "Access" RENAME TO "Access_old";
ALTER TYPE "Access_new" RENAME TO "Access";
DROP TYPE "Access_old";
COMMIT;
