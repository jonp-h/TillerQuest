import { LinearProgress, Typography } from "@mui/material";
import { $Enums } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import RarityText from "./RarityText";
import { LocalPolice } from "@mui/icons-material";

interface MiniatureProfileProps {
  member: {
    id: string;
    username: string | null;
    title: string | null;
    titleRarity: $Enums.Rarity | null;
    image: string | null;
    hp: number;
    hpMax: number;
    mana: number;
    manaMax: number;
    guild: {
      guildLeader: string | null;
      nextGuildLeader?: string | null;
    } | null;
  };
}

export default function MiniatureProfile({ member }: MiniatureProfileProps) {
  const image = member.hp !== 0 ? member.image + ".png" : "Grave.png";
  return (
    <Link key={member.username} href={"/profile/" + member.username}>
      <div className="flex flex-col justify-center">
        <div className="relative flex justify-center self-center from-zinc-600 to-zinc-700 bg-radial p-1.5 rounded-full">
          <Image
            className="rounded-full"
            draggable="false"
            src={"/classes/" + image}
            alt={member.username || "Guild member"}
            width={100}
            height={100}
          />
          {member.guild?.guildLeader === member.id && (
            <div className="absolute top-0 right-0 text-amber-500">
              <LocalPolice />
            </div>
          )}
          {member.guild?.nextGuildLeader === member.id && (
            <div className="absolute top-0 right-0 opacity-20 animate-pulse text-amber-500">
              <LocalPolice />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 text-center">
          <RarityText className="-mb-1.5" rarity={member.titleRarity ?? ""}>
            {member.title}
          </RarityText>
          <Typography variant="body1" flexWrap="wrap">
            {member.username}
          </Typography>
          {/* Health bar */}
          <LinearProgress
            className="w-32 self-center"
            variant="determinate"
            value={(member.hp / member.hpMax) * 100}
            color="health"
          />

          {/* Mana bar */}
          <LinearProgress
            className="w-32 self-center"
            variant="determinate"
            value={(member.mana / member.manaMax) * 100}
            color="mana"
          />
        </div>
      </div>
    </Link>
  );
}
