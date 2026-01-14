/*
  Warnings:

  - You are about to drop the `SystemMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ReadMessages` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'INACTIVE';

-- DropForeignKey
ALTER TABLE "_ReadMessages" DROP CONSTRAINT "_ReadMessages_A_fkey";

-- DropForeignKey
ALTER TABLE "_ReadMessages" DROP CONSTRAINT "_ReadMessages_B_fkey";

-- DropTable
DROP TABLE "SystemMessage";

-- DropTable
DROP TABLE "_ReadMessages";

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReadNotifications" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReadNotifications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ReadNotifications_B_index" ON "_ReadNotifications"("B");

-- AddForeignKey
ALTER TABLE "_ReadNotifications" ADD CONSTRAINT "_ReadNotifications_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReadNotifications" ADD CONSTRAINT "_ReadNotifications_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
