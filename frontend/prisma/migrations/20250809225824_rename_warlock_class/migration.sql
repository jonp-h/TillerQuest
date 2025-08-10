/*
  Warnings:

  - The values [BloodMage] on the enum `AbilityCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [BloodMage] on the enum `Class` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AbilityCategory_new" AS ENUM ('Health', 'Mana', 'Experience', 'Damage', 'Strength', 'Agility', 'Trickery', 'Magic', 'Heal', 'Adventurer', 'Arena', 'Cosmic', 'Dungeon', 'Druid', 'Wizard', 'Barbarian', 'Warlock', 'Bard');
ALTER TABLE "Ability" ALTER COLUMN "category" TYPE "AbilityCategory_new" USING ("category"::text::"AbilityCategory_new");
ALTER TYPE "AbilityCategory" RENAME TO "AbilityCategory_old";
ALTER TYPE "AbilityCategory_new" RENAME TO "AbilityCategory";
DROP TYPE "AbilityCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Class_new" AS ENUM ('Druid', 'Wizard', 'Barbarian', 'Warlock', 'Bard');
ALTER TABLE "User" ALTER COLUMN "class" TYPE "Class_new" USING ("class"::text::"Class_new");
ALTER TABLE "ShopItem" ALTER COLUMN "classReq" TYPE "Class_new" USING ("classReq"::text::"Class_new");
ALTER TYPE "Class" RENAME TO "Class_old";
ALTER TYPE "Class_new" RENAME TO "Class";
DROP TYPE "Class_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Ability" DROP CONSTRAINT "Ability_parentAbility_fkey";

-- AddForeignKey
ALTER TABLE "Ability" ADD CONSTRAINT "Ability_parentAbility_fkey" FOREIGN KEY ("parentAbility") REFERENCES "Ability"("name") ON DELETE CASCADE ON UPDATE CASCADE;
