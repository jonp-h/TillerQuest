"use client";
import { LinearProgress, Typography } from "@mui/material";
import Image from "next/image";
import clsx from "clsx";
import { AbilityTarget } from "@prisma/client";

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
  target: AbilityTarget;
  selectedUser: string | undefined;
  setSelectedUser: React.Dispatch<React.SetStateAction<string>>;
  guildMembers: guildMembers;
}

function AbilityUserSelect({
  target,
  selectedUser,
  setSelectedUser,
  guildMembers,
}: Props) {
  return (
    <>
      {target === "All" ? (
        <Typography variant="h6" color="violet">
          Everyone in the guild is affected by this ability.
        </Typography>
      ) : target === "Others" ? (
        <Typography variant="h6" color="violet">
          All other guild members are affected by this ability.
        </Typography>
      ) : target === "Self" ? (
        <Typography variant="h6" color="violet">
          Target self.
        </Typography>
      ) : (
        <div className="flex justify-center my-5 gap-10">
          {guildMembers?.map((member) => (
            <div
              key={member.id}
              className="flex flex-col justify-center cursor-pointer"
              onClick={() => setSelectedUser(member.id)}
            >
              <div
                className={clsx(
                  "from-zinc-600 to-zinc-700 bg-radial p-3 rounded-full flex items-center justify-center m-auto hover:scale-105 transition-transform",
                  selectedUser === member.id && "border-2 border-purple-600",
                )}
                style={{
                  width: 128,
                  height: 128,
                  minWidth: 128,
                  minHeight: 128,
                }}
              >
                <Image
                  className="rounded-full"
                  draggable="false"
                  src={
                    member.hp !== 0
                      ? "/classes/" + member.image + ".png"
                      : "/classes/grave.png"
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
      )}
    </>
  );
}

export default AbilityUserSelect;
