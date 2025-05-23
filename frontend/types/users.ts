export interface UserProfile {
  id: string;
  username: string | null;
  name: string | null;
  lastname: string | null;
  image: string | null;
  hp: number;
  hpMax: number;
  mana: number;
  manaMax: number;
  xp: number;
  level: number;
  title: string | null;
  class: string | null;
  guildName: string | null;
  gold: number;
  arenaTokens: number;
  gemstones: number;
  publicHighscore: boolean;
  archiveConsent: boolean;
  inventory: {
    name: string;
    specialReq: string | null;
    description: string | null;
  }[];
  lastMana: Date;
}
