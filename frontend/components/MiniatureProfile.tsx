import { LinearProgress, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

interface MiniatureProfileProps {
  member: {
    id: string;
    image: string | null;
    username: string | null;
    hp: number;
    hpMax: number;
    mana: number;
    manaMax: number;
  };
}

export default function MiniatureProfile({ member }: MiniatureProfileProps) {
  const image = member.hp !== 0 ? member.image + ".png" : "Grave.png";
  return (
    <Link key={member.username} href={"/profile/" + member.username}>
      <div className="flex flex-col justify-center">
        <div className="flex justify-center self-center from-zinc-600 to-zinc-700 bg-gradient-radial p-1.5 rounded-full">
          <Image
            className="rounded-full"
            draggable="false"
            src={"/classes/" + image}
            alt={member.username || "Guild member"}
            width={100}
            height={100}
          />
        </div>
        <div className="flex flex-col gap-1 text-center">
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
