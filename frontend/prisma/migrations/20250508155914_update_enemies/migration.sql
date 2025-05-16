/*
  Warnings:

  - The primary key for the `Enemy` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Enemy" DROP CONSTRAINT "Enemy_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Enemy_pkey" PRIMARY KEY ("id");
