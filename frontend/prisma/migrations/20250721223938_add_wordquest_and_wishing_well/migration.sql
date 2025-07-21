-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Access" ADD VALUE 'WordQuest';
ALTER TYPE "Access" ADD VALUE 'WIP';

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "data" INTEGER[],
ADD COLUMN     "mistakes" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "Wish" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "value" INTEGER NOT NULL DEFAULT 0,
    "scheduled" TIMESTAMP(3),

    CONSTRAINT "Wish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "wishId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordQuestWord" (
    "id" SERIAL NOT NULL,
    "genre" TEXT NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "WordQuestWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wish_name_key" ON "Wish"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WishVote_userId_wishId_key" ON "WishVote"("userId", "wishId");

-- CreateIndex
CREATE UNIQUE INDEX "WordQuestWord_word_key" ON "WordQuestWord"("word");

-- AddForeignKey
ALTER TABLE "WishVote" ADD CONSTRAINT "WishVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishVote" ADD CONSTRAINT "WishVote_wishId_fkey" FOREIGN KEY ("wishId") REFERENCES "Wish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
