-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL DEFAULT 'Newborn',
    `schoolClass` ENUM('IM1', 'IM2', 'IM3', 'IM4', 'IT1', 'IT2', 'IT3', 'MP1', 'MP2', 'MP3') NULL,
    `class` ENUM('Druid', 'Wizard', 'Barbarian') NULL,
    `image` VARCHAR(191) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `xp` INTEGER NOT NULL DEFAULT 1,
    `xpToLevel` INTEGER NOT NULL DEFAULT 100,
    `hp` INTEGER NOT NULL DEFAULT 40,
    `hpMax` INTEGER NOT NULL DEFAULT 40,
    `mana` INTEGER NOT NULL DEFAULT 0,
    `manaMax` INTEGER NOT NULL DEFAULT 40,
    `lastMana` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gemstones` INTEGER NOT NULL DEFAULT 1,
    `gold` INTEGER NOT NULL DEFAULT 0,
    `guildName` VARCHAR(191) NULL,
    `role` ENUM('NEW', 'USER', 'ADMIN') NOT NULL DEFAULT 'NEW',
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guild` (
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ability` (
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('Health', 'Mana', 'Strength', 'Agility', 'Trickery', 'Magic', 'Heal', 'Druid', 'Wizard', 'Barbarian') NOT NULL,
    `isPassive` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(191) NULL,
    `duration` INTEGER NULL,
    `icon` VARCHAR(191) NULL,
    `gemstoneCost` INTEGER NOT NULL DEFAULT 1,
    `manaCost` INTEGER NULL DEFAULT 2,
    `xpGiven` INTEGER NULL DEFAULT 0,
    `value` INTEGER NULL,
    `parentAbility` VARCHAR(191) NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAbility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `abilityName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserAbility_userId_abilityName_key`(`userId`, `abilityName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EffectsOnUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `abilityName` VARCHAR(191) NULL,
    `effectType` ENUM('Health', 'Mana', 'Strength', 'Agility', 'Trickery', 'Magic', 'Heal', 'Druid', 'Wizard', 'Barbarian') NOT NULL,
    `endTime` DATETIME(3) NULL,
    `value` INTEGER NULL,

    UNIQUE INDEX `EffectsOnUser_userId_abilityName_key`(`userId`, `abilityName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `access_token` VARCHAR(191) NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` VARCHAR(191) NULL,
    `session_state` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_guildName_fkey` FOREIGN KEY (`guildName`) REFERENCES `Guild`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ability` ADD CONSTRAINT `Ability_parentAbility_fkey` FOREIGN KEY (`parentAbility`) REFERENCES `Ability`(`name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `UserAbility` ADD CONSTRAINT `UserAbility_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAbility` ADD CONSTRAINT `UserAbility_abilityName_fkey` FOREIGN KEY (`abilityName`) REFERENCES `Ability`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EffectsOnUser` ADD CONSTRAINT `EffectsOnUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EffectsOnUser` ADD CONSTRAINT `EffectsOnUser_abilityName_fkey` FOREIGN KEY (`abilityName`) REFERENCES `Ability`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
