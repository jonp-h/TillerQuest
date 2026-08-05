"use client";
import { FullUser } from "@/types/users";
import RarityText from "@/components/RarityText";
import { Button, LinearProgress, Typography } from "@mui/material";
import { LocalPolice } from "@mui/icons-material";
import Image from "next/image";

function PlayerCard({
  user,
  adminAction,
}: {
  user: FullUser;
  adminAction: (action: string, userId: string) => void;
}) {
  const image = user.hp !== 0 ? user.image + ".png" : "Grave.png";

  return (
    <div className={"flex flex-col justify-center"}>
      <div
        className={
          "relative flex justify-center self-center rounded-full transition-all duration-200 from-zinc-600 to-zinc-700 bg-radial p-1.5 lg:p-3"
        }
      >
        {/* Hover group */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center gap-5 p-15">
          <Button
            variant="contained"
            onClick={() => adminAction("xp", user.id)}
          >
            Grant XP
          </Button>
          <Button
            variant="contained"
            color="health"
            onClick={() => adminAction("damage", user.id)}
          >
            Deal damage
          </Button>
        </div>
        <Image
          className="rounded-full"
          draggable="false"
          src={"/classes/" + image}
          alt={user.username || "Guild user"}
          width={130}
          height={130}
          //   sizes="(max-width: 640px) 60px, (max-width: 768px) 80px, 100px"
          style={{
            width: "auto",
            height: "auto",
            // maxWidth: "100px",
            // maxHeight: "100px",
          }}
        />
        {user.guild?.guildLeader === user.id && (
          <div className="absolute top-0 right-0 text-gray-300 text-lg sm:text-xl md:text-2xl">
            <LocalPolice fontSize="inherit" />
          </div>
        )}
        {user.guild?.nextGuildLeader === user.id && (
          <div className="absolute top-0 right-0 opacity-20 animate-pulse text-gray-300 text-lg sm:text-xl md:text-2xl">
            <LocalPolice fontSize="inherit" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 text-center items-center">
        <RarityText
          width="full"
          className="-mb-1.5"
          rarity={user.titleRarity ?? ""}
        >
          {user.title}
        </RarityText>
        <Typography
          variant="body1"
          noWrap
          className="text-sm sm:text-base w-3/4 max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {user.name}{" "}
          <span className="font-bold">&quot;{user.username}&quot;</span>{" "}
          {user.lastname}
        </Typography>
        {/* Health bar */}
        <LinearProgress
          className="w-3/4 self-center"
          variant="determinate"
          value={(user.hp / user.hpMax) * 100}
          color="health"
        />

        {/* Mana bar */}
        <LinearProgress
          className="w-3/4 self-center"
          variant="determinate"
          value={(user.mana / user.manaMax) * 100}
          color="mana"
        />
      </div>
    </div>
  );
}

export default PlayerCard;
