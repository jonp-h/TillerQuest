-- AlterTable
ALTER TABLE "Ability" ADD COLUMN     "isDungeon" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "Enemy" (
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "attack" TEXT NOT NULL,
    "health" INTEGER NOT NULL DEFAULT 10,
    "maxHealth" INTEGER NOT NULL DEFAULT 10,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Enemy_pkey" PRIMARY KEY ("name")
);
