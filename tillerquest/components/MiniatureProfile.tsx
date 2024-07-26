import { LinearProgress, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function MiniatureProfile(props: any) {
  const image =
    props.member.hp !== 0 ? props.member.image + ".jpg" : "grave.jpg";
  return (
    <Link key={props.key} href={"/profile/" + props.member.username}>
      <div className="flex flex-col justify-center">
        <div className="from-zinc-600 to-zinc-700 bg-gradient-radial p-1.5 rounded-full">
          <Image
            className="rounded-full"
            draggable="false"
            src={"/classes/" + image}
            alt="Clan member"
            width={100}
            height={100}
          />
        </div>
        <div className="flex flex-col gap-1 text-center">
          <Typography variant="body1" flexWrap="wrap">
            {props.member.username}
          </Typography>
          {/* Health bar */}
          <LinearProgress
            variant="determinate"
            value={(props.member.hp / props.member.hpMax) * 100}
            color="health"
          />

          {/* Mana bar */}
          <LinearProgress
            variant="determinate"
            value={(props.member.mana / props.member.manaMax) * 100}
            color="mana"
          />
        </div>
      </div>
    </Link>
  );
}
