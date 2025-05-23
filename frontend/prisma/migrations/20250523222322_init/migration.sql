-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('NEW', 'USER', 'ARCHIVED', 'ADMIN');

-- CreateEnum
CREATE TYPE "SchoolClass" AS ENUM ('Class_1IM1', 'Class_1IM2', 'Class_1IM3', 'Class_1IM4', 'Class_2IT1', 'Class_2IT2', 'Class_2IT3', 'Class_2MP1');

-- CreateEnum
CREATE TYPE "Class" AS ENUM ('Druid', 'Wizard', 'Barbarian', 'BloodMage', 'Bard');

-- CreateEnum
CREATE TYPE "AbilityCategory" AS ENUM ('Health', 'Mana', 'Experience', 'Damage', 'Strength', 'Agility', 'Trickery', 'Magic', 'Heal', 'Adventurer', 'Cosmic', 'Dungeon', 'Druid', 'Wizard', 'Barbarian', 'BloodMage', 'Bard');

-- CreateEnum
CREATE TYPE "AbilityType" AS ENUM ('Heal', 'XP', 'Mana', 'Swap', 'Transfer', 'Trade', 'Revive', 'Damage', 'ArenaToken', 'Gold', 'TurnPassive', 'DungeonAttack', 'Deathsave', 'Cosmic', 'All', 'Health', 'ManaPassive', 'Experience', 'Protection', 'Strength', 'Agility', 'Trickery', 'Postpone', 'Magic', 'Adventurer', 'Arena', 'Turns', 'GoldPassive', 'IncreaseHealth', 'DecreaseHealth', 'IncreaseMana', 'DecreaseMana');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('PENDING', 'INPROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "ShopItemType" AS ENUM ('Title', 'Badge');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "lastname" TEXT,
    "title" TEXT DEFAULT 'Newborn',
    "schoolClass" "SchoolClass",
    "class" "Class",
    "image" TEXT,
    "turns" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 1,
    "hp" INTEGER NOT NULL DEFAULT 40,
    "hpMax" INTEGER NOT NULL DEFAULT 40,
    "mana" INTEGER NOT NULL DEFAULT 0,
    "manaMax" INTEGER NOT NULL DEFAULT 40,
    "lastMana" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gemstones" INTEGER NOT NULL DEFAULT 1,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "arenaTokens" INTEGER NOT NULL DEFAULT 0,
    "special" TEXT[],
    "guildName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'NEW',
    "publicHighscore" BOOLEAN NOT NULL DEFAULT false,
    "archiveConsent" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "schoolClass" "SchoolClass",

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Ability" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AbilityCategory" NOT NULL,
    "type" "AbilityType" NOT NULL,
    "target" INTEGER NOT NULL DEFAULT -1,
    "description" TEXT,
    "duration" INTEGER,
    "icon" TEXT,
    "gemstoneCost" INTEGER NOT NULL DEFAULT 1,
    "manaCost" INTEGER,
    "healthCost" INTEGER,
    "xpGiven" INTEGER,
    "value" INTEGER,
    "diceNotation" TEXT,
    "isDungeon" BOOLEAN NOT NULL DEFAULT false,
    "purchaseable" BOOLEAN NOT NULL DEFAULT true,
    "cosmicEvent" TEXT[],
    "parentAbility" TEXT,

    CONSTRAINT "Ability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enemy" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "attack" TEXT NOT NULL,
    "maxHealth" INTEGER NOT NULL DEFAULT 10,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Enemy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildEnemy" (
    "id" TEXT NOT NULL,
    "enemyId" INTEGER NOT NULL,
    "guildName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "health" INTEGER NOT NULL,

    CONSTRAINT "GuildEnemy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAbility" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "abilityName" TEXT NOT NULL,
    "fromCosmic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPassive" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passiveName" TEXT NOT NULL,
    "abilityName" TEXT,
    "cosmicEvent" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "effectType" "AbilityType" NOT NULL,
    "endTime" TIMESTAMP(3),
    "value" INTEGER,

    CONSTRAINT "UserPassive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CosmicEvent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Cosmic.png',
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "presetDate" TIMESTAMP(3),
    "occurrences" INTEGER NOT NULL DEFAULT 0,
    "frequency" INTEGER NOT NULL DEFAULT 100,
    "automatic" BOOLEAN NOT NULL DEFAULT false,
    "increaseCostType" "AbilityType",
    "increaseCostValue" INTEGER,
    "blockAbilityType" "AbilityType",
    "triggerAtNoon" BOOLEAN NOT NULL DEFAULT false,
    "grantAbility" BOOLEAN NOT NULL DEFAULT false,
    "abilityName" TEXT,

    CONSTRAINT "CosmicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "price" INTEGER NOT NULL,
    "type" "ShopItemType" NOT NULL,
    "levelReq" INTEGER,
    "classReq" "Class",
    "specialReq" TEXT,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "global" BOOLEAN NOT NULL DEFAULT true,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "GameStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeQuestText" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "TypeQuestText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ShopItemToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ShopItemToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Ability_name_key" ON "Ability"("name");

-- CreateIndex
CREATE INDEX "Ability_name_idx" ON "Ability"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserAbility_userId_abilityName_key" ON "UserAbility"("userId", "abilityName");

-- CreateIndex
CREATE UNIQUE INDEX "UserPassive_userId_abilityName_key" ON "UserPassive"("userId", "abilityName");

-- CreateIndex
CREATE UNIQUE INDEX "CosmicEvent_name_key" ON "CosmicEvent"("name");

-- CreateIndex
CREATE INDEX "CosmicEvent_name_idx" ON "CosmicEvent"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_name_key" ON "ShopItem"("name");

-- CreateIndex
CREATE INDEX "ShopItem_name_idx" ON "ShopItem"("name");

-- CreateIndex
CREATE INDEX "ShopItem_type_idx" ON "ShopItem"("type");

-- CreateIndex
CREATE INDEX "Game_userId_idx" ON "Game"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TypeQuestText_text_key" ON "TypeQuestText"("text");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "_ShopItemToUser_B_index" ON "_ShopItemToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildName_fkey" FOREIGN KEY ("guildName") REFERENCES "Guild"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ability" ADD CONSTRAINT "Ability_parentAbility_fkey" FOREIGN KEY ("parentAbility") REFERENCES "Ability"("name") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GuildEnemy" ADD CONSTRAINT "GuildEnemy_enemyId_fkey" FOREIGN KEY ("enemyId") REFERENCES "Enemy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildEnemy" ADD CONSTRAINT "GuildEnemy_guildName_fkey" FOREIGN KEY ("guildName") REFERENCES "Guild"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAbility" ADD CONSTRAINT "UserAbility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAbility" ADD CONSTRAINT "UserAbility_abilityName_fkey" FOREIGN KEY ("abilityName") REFERENCES "Ability"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPassive" ADD CONSTRAINT "UserPassive_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPassive" ADD CONSTRAINT "UserPassive_abilityName_fkey" FOREIGN KEY ("abilityName") REFERENCES "Ability"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CosmicEvent" ADD CONSTRAINT "CosmicEvent_abilityName_fkey" FOREIGN KEY ("abilityName") REFERENCES "Ability"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShopItemToUser" ADD CONSTRAINT "_ShopItemToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShopItemToUser" ADD CONSTRAINT "_ShopItemToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
