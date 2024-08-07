"use client";
import { LinearProgress, Typography } from "@mui/material";
import React from "react";
import Image from "next/image";
import clsx from "clsx";

type guildMembers =
  | {
      id: string;
      image: string | null;
      username: string | null;
      hp: number;
      hpMax: number;
      mana: number;
      manaMax: number;
    }[]
  | null;

interface Props {
  selectedUser: string | undefined;
  setSelectedUser: React.Dispatch<React.SetStateAction<string>>;
  guildMembers: guildMembers;
}

function AbilityUserSelect({
  selectedUser,
  setSelectedUser,
  guildMembers,
}: Props) {
  return (
    <div className="flex justify-center my-5 gap-10">
      {guildMembers?.map((member) => (
        <div
          key={member.id}
          className="flex flex-col justify-center"
          onClick={() => setSelectedUser(member.id)}
        >
          <div
            className={clsx(
              "from-zinc-600 to-zinc-700 bg-gradient-radial p-3 rounded-full",
              selectedUser === member.id && "border-2 border-purple-600"
            )}
          >
            <Image
              className="rounded-full"
              draggable="false"
              src={
                member.hp !== 0
                  ? "/classes/" + member.image + ".jpg"
                  : "/classes/grave.jpg"
              }
              alt={member.username || "Guild member"}
              width={100}
              height={100}
            />
          </div>
          <div className="flex flex-col gap-1 text-center">
            <Typography
              variant="body1"
              flexWrap="wrap"
              color={selectedUser === member.id ? "violet" : "white"}
            >
              {member.username}
            </Typography>
            {/*  Health bar */}
            <LinearProgress
              variant="determinate"
              value={(member.hp / member.hpMax) * 100}
              color="health"
            />

            {/*  Mana bar */}
            <LinearProgress
              variant="determinate"
              value={(member.mana / member.manaMax) * 100}
              color="mana"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default AbilityUserSelect;
