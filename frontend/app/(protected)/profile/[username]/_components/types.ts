import { Prisma } from "@prisma/client";
import { DateToString } from "@/types/dateToString";

/**
 * User profile with all relations
 * Dates are strings because this comes from API (JSON serialized)
 */
export type UserProfile = DateToString<
  Prisma.UserGetPayload<{
    select: {
      id: true;
      title: true;
      titleRarity: true;
      name: true;
      username: true;
      lastname: true;
      class: true;
      gold: true;
      hp: true;
      hpMax: true;
      mana: true;
      manaMax: true;
      xp: true;
      gemstones: true;
      arenaTokens: true;
      turns: true;
      level: true;
      image: true;
      guildName: true;
      schoolClass: true;
      lastMana: true;
      publicHighscore: true;
      archiveConsent: true;
      guild: {
        select: {
          guildLeader: true;
          icon: true;
        };
      };
      inventory: {
        select: {
          name: true;
          icon: true;
          description: true;
          rarity: true;
        };
      };
      passives: {
        select: {
          endTime: true;
          passiveName: true;
          icon: true;
          value: true;
          ability: {
            select: {
              name: true;
              description: true;
            };
          };
        };
      };
      abilities: {
        select: {
          ability: {
            select: {
              name: true;
              icon: true;
            };
          };
        };
      };
    };
  }>
>;

/**
 * Guild members with relations
 * Dates are strings because this comes from API (JSON serialized)
 */
export type GuildMembers = DateToString<
  Prisma.GuildGetPayload<{
    select: {
      id: true;
      title: true;
      titleRarity: true;
      username: true;
      image: true;
      hp: true;
      hpMax: true;
      mana: true;
      manaMax: true;
      class: true;
      guild: {
        select: {
          guildLeader: true;
        };
      };
    };
  }>
>;
