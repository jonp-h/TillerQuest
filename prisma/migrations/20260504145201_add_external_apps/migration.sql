/*
  Warnings:

  - You are about to drop the `ApplicationSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "Access" ADD VALUE 'Tillerio';

-- DropTable
DROP TABLE "ApplicationSettings";

-- CreateTable
CREATE TABLE "App" (
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT,
    "scheduled" TIMESTAMP(3),
    "scheduleInfoText" TEXT,
    "downloadUrl" TEXT,

    CONSTRAINT "App_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "TillerQuestSettings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TillerQuestSettings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "deviceCode" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "lastPolledAt" TIMESTAMP(3),
    "pollingInterval" INTEGER,
    "clientId" TEXT,
    "scope" TEXT,

    CONSTRAINT "deviceCode_pkey" PRIMARY KEY ("id")
);
