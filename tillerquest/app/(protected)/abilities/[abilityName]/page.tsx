import { auth } from "@/auth";
import MainContainer from "@/components/MainContainer";
import { checkIfUserOwnsAbility, getAbility } from "@/data/abilities";
import { getMembersByCurrentUserGuild, getUserById } from "@/data/user";
import { Paper, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import React from "react";
import UseAbilityForm from "./_components/UseAbilityForm";
import Image from "next/image";
import AbilityUserSelect from "./_components/AbilityUserSelect";

export default async function AbilitiesPage({
  params: { abilityName },
}: {
  params: { abilityName: string };
}) {
  const ability = await getAbility(abilityName);
  const session = await auth();

  if (!ability || !session?.user.id) {
    console.error("Ability not found or user not logged in.");
    notFound();
  }

  const user = await getUserById(session?.user.id);
  if (!user) {
    notFound();
  }

  const userOwnsAbility = await checkIfUserOwnsAbility(
    session?.user.id,
    abilityName
  );

  // check if root, if not check if user owns parent ability
  var missingParentAbility = true;
  if (ability.parentAbility === null) {
    missingParentAbility = false;
  } else {
    missingParentAbility = !(await checkIfUserOwnsAbility(
      user.id,
      ability.parentAbility
    ));
  }

  const guildMembers = await getMembersByCurrentUserGuild(user.guildName || "");

  return (
    <MainContainer>
      <div className="flex justify-center">
        <Paper
          elevation={5}
          className=" text-center items-center p-5 w-full md:w-1/2"
        >
          <div className="flex justify-center">
            <div className="flex justify-center rounded-full mb-3 p-5 from-zinc-600 to-zinc-700 bg-gradient-radial">
              {/* TODO: change to/from icon? */}
              {ability.name && (
                <Image
                  className="rounded-full"
                  src={"/abilities/" + ability.name + ".jpg"}
                  alt={ability.name}
                  width={200}
                  height={200}
                />
              )}
            </div>
          </div>
          <Typography variant="h3">{ability.name.replace("-", " ")}</Typography>
          <div className="flex justify-around">
            <Typography variant="h6" color="aquamarine">
              {ability.type}
            </Typography>
            {!ability.isPassive && (
              <Typography variant="h6" color="orange">
                XP: {ability.xpGiven}
              </Typography>
            )}
          </div>
          <Typography variant="body1">{ability.description}</Typography>
          <div className="flex justify-around">
            <Typography variant="h6" color="error">
              Cost: {ability.cost}
            </Typography>
            <Typography variant="h6" color="cyan">
              Value: {ability.value}
            </Typography>
          </div>
          <div></div>
          {missingParentAbility && (
            <Typography variant="body1" color="error">
              You don't own the necessary parent abilities.
            </Typography>
          )}
          <UseAbilityForm
            ability={ability}
            user={user}
            userOwnsAbility={userOwnsAbility}
            missingParentAbility={missingParentAbility}
            guildMembers={guildMembers}
          />
        </Paper>
      </div>
    </MainContainer>
  );
}
