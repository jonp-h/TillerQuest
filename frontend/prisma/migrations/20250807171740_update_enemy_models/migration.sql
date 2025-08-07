/*
  Warnings:

  - You are about to drop the column `attack` on the `Enemy` table. All the data in the column will be lost.
  - You are about to drop the column `gold` on the `Enemy` table. All the data in the column will be lost.
  - You are about to drop the column `maxHealth` on the `Enemy` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `Enemy` table. All the data in the column will be lost.
  - Added the required column `attack` to the `GuildEnemy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gold` to the `GuildEnemy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `GuildEnemy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxHealth` to the `GuildEnemy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xp` to the `GuildEnemy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Enemy" DROP COLUMN "attack",
DROP COLUMN "gold",
DROP COLUMN "maxHealth",
DROP COLUMN "xp";

-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "guildLeader" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nextGuildLeader" TEXT;

-- AlterTable
ALTER TABLE "GuildEnemy" ADD COLUMN     "attack" INTEGER NOT NULL,
ADD COLUMN     "gold" INTEGER NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "maxHealth" INTEGER NOT NULL,
ADD COLUMN     "xp" INTEGER NOT NULL;
