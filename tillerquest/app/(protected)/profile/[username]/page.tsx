import MainContainer from "@/components/MainContainer";
import { getMembersByCurrentUserGuild, getUserByUsername } from "@/data/user";
import { Button, LinearProgress, Paper, Typography } from "@mui/material";
import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { red, blue } from "@mui/material/colors";
import { AutoAwesome, Circle, Diamond } from "@mui/icons-material";
import MiniatureProfile from "@/components/MiniatureProfile";
import { getUserAbilities } from "@/data/abilities";
import { getUserEffects } from "@/data/effects";
import TimeLeft from "@/components/TimeLeft";
import Ability from "@/components/Ability";
import Link from "next/link";
import { getLevel } from "@/lib/levels";

export default async function ProfilePage({
  params: { username },
}: {
  params: { username: string };
}) {
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const guildMembers = await getMembersByCurrentUserGuild(user.guildName || "");

  const userAbilities = await getUserAbilities(user.id);
  const userEffects = await getUserEffects(user.id);

  // Server-side component: date-time check
  const currentDate = new Date();
  const isWeekend = () => {
    const dayOfWeek = currentDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <MainContainer>
      {/* If the user has not recieved mana today, and it is not weekend  */}
      {user.lastMana.toISOString().slice(0, 10) !=
        currentDate.toISOString().slice(0, 10) &&
        !isWeekend() && (
          <Paper
            elevation={6}
            className="m-3 p-5 flex gap-5 text-center justify-center"
          >
            <Typography variant="h5" align="center">
              You sense magic in the air
            </Typography>
            <Link href="/mana">
              <Button variant="contained" color="primary">
                Get mana
              </Button>
            </Link>
          </Paper>
        )}
      <div className="flex flex-col justify-center md:flex-row">
        {user.guildName && (
          <Paper
            elevation={6}
            className="flex flex-col m-3 gap-3 items-center p-5 md:w-2/12 w-full order-2 md:order-1"
          >
            <Typography variant="h4" align="center" flexWrap="wrap">
              {user.guildName}
            </Typography>
            {guildMembers?.map((member: any) =>
              member.username !== user.username ? (
                <MiniatureProfile key={member.id} member={member} />
              ) : null
            )}
          </Paper>
        )}
        <Paper
          className="flex flex-col m-3 gap-3 items-center p-5 md:w-5/12 w-full order-first md:order-2"
          elevation={5}
        >
          <div className="from-zinc-600 to-zinc-700 bg-gradient-radial p-3 rounded-full">
            <Image
              className="rounded-full"
              src={"/classes/" + user.image + ".jpg" || ""}
              alt={user.username || ""}
              width={250}
              height={250}
              draggable={false}
            />
          </div>
          <div className=" flex justify-evenly gap-3 items-center text-2xl">
            <Typography variant="h5">{user.name}</Typography>
            <Typography
              variant="h4"
              color="Highlight"
              sx={{ fontWeight: "bold" }}
            >
              &quot;{user?.username}&quot;
            </Typography>
            <Typography variant="h5">{user?.lastname}</Typography>
          </div>
          <div className="flex gap-5">
            <Typography variant="h6" color="aquamarine">
              {user.title}
            </Typography>
            <Typography variant="h6" color="aquamarine">
              {user.class}
            </Typography>
            <Typography variant="h6" color="aquamarine">
              Level: {user.level}
            </Typography>
          </div>

          <div className="flex flex-col gap-3 w-3/4 lg:w-2/4 text-center">
            <div>
              <Typography variant="body2" color="orange">
                XP: {user.xp} / {user.xpToLevel}
              </Typography>
              <LinearProgress
                color="experience"
                variant="determinate"
                value={(user.hp / user.hpMax) * 100}
              />
            </div>
            <div>
              <Typography variant="body2" color={red[600]}>
                HP: {user.hp} / {user.hpMax}
              </Typography>
              <LinearProgress
                color="health"
                variant="determinate"
                value={(user.hp / user.hpMax) * 100}
              />
            </div>
            <div>
              <Typography variant="body2" color={blue[300]}>
                Mana: {user.mana} / {user.manaMax}
              </Typography>
              <LinearProgress
                color="mana"
                variant="determinate"
                value={(user.mana / user.manaMax) * 100}
              />
            </div>
          </div>
        </Paper>
        <div className="flex flex-col m-3 gap-3 items-center md:w-5/12 w-full order-3 md:order-2">
          <Paper
            className="flex flex-col items-center p-5 w-full h-1/4"
            elevation={5}
          >
            <Typography variant="h4">Resources</Typography>
            <div className="flex mt-2 gap-10">
              <Typography variant="h5" color="gold">
                Gold: {user.gold}
                <Circle />
              </Typography>
              <Typography variant="h5" color="cyan">
                Gemstones: {user.gemstones}
                <Diamond />
              </Typography>
              <Button variant="contained" color="secondary">
                Level up
              </Button>
            </div>
          </Paper>
          <Paper className=" items-center p-5 w-full h-3/4" elevation={6}>
            <Typography variant="h4" align="center">
              Active effects
            </Typography>
            <div className="grid grid-cols-3 lg:grid-cols-4 mt-4 gap-4">
              {userEffects?.map((effect: any) => (
                <Paper
                  elevation={10}
                  key={effect.ability.name}
                  className=" flex flex-col justify-center text-center items-center p-2"
                >
                  <Image
                    className="rounded-full border-slate-700 border-2"
                    src={"/abilities/" + effect.ability.name + ".jpg"}
                    alt={effect.ability.name}
                    draggable={false}
                    width={50}
                    height={50}
                  />
                  <Typography variant="h6">
                    {effect.ability.name.replace("-", " ")}
                  </Typography>
                  {effect.endTime && (
                    <TimeLeft endTime={new Date(effect.endTime)} />
                  )}
                </Paper>
              ))}
            </div>
          </Paper>
        </div>
      </div>
      <Paper elevation={6} className="mx-3">
        <Typography variant="h4" align="center">
          Abilities
        </Typography>
        <div className="grid grid-cols-6 gap-3 p-5">
          {userAbilities?.map((ability: any) => (
            <Ability key={ability.id} ability={ability} />
          ))}
        </div>
      </Paper>
    </MainContainer>
  );
}
