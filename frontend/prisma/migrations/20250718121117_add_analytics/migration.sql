-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "category" TEXT,
    "gameId" TEXT,
    "abilityId" INTEGER,
    "targetCount" INTEGER,
    "hpChange" INTEGER,
    "manaChange" INTEGER,
    "xpChange" INTEGER,
    "goldChange" INTEGER,
    "manaCost" INTEGER,
    "healthCost" INTEGER,
    "gemstoneCost" INTEGER,
    "userLevel" INTEGER,
    "userClass" TEXT,
    "guildName" TEXT,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analytics_userId_createdAt_idx" ON "Analytics"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Analytics_triggerType_createdAt_idx" ON "Analytics"("triggerType", "createdAt");

-- CreateIndex
CREATE INDEX "Analytics_abilityId_createdAt_idx" ON "Analytics"("abilityId", "createdAt");

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
