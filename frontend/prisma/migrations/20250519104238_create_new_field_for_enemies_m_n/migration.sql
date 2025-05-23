/*
  Warnings:

  - You are about to drop the column `health` on the `Enemy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Enemy" DROP COLUMN "health";

-- CreateTable
CREATE TABLE "GuildEnemy" (
    "enemyId" INTEGER NOT NULL,
    "guildName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "health" INTEGER NOT NULL,

    CONSTRAINT "GuildEnemy_pkey" PRIMARY KEY ("enemyId","guildName")
);

-- AddForeignKey
ALTER TABLE "GuildEnemy" ADD CONSTRAINT "GuildEnemy_enemyId_fkey" FOREIGN KEY ("enemyId") REFERENCES "Enemy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildEnemy" ADD CONSTRAINT "GuildEnemy_guildName_fkey" FOREIGN KEY ("guildName") REFERENCES "Guild"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
