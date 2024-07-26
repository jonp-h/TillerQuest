import { auth } from "@/auth";
import MainContainer from "@/components/MainContainer";
import { checkIfUserOwnsAbility, getAbility } from "@/data/abilities";
import { getUserById } from "@/data/user";
import { Paper, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import React from "react";
import UseAbilityForm from "./_components/UseAbilityForm";

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

  return (
    <MainContainer>
      <div className="flex justify-center">
        <Paper
          elevation={5}
          className="text-center items-center p-5 w-full md:w-1/2"
        >
          <Typography variant="h3">{ability.name}</Typography>
          <div className="flex justify-around">
            <Typography variant="h6" color="aquamarine">
              {ability.type}
            </Typography>
            <Typography variant="h6" color="orange">
              XP: {ability.xpGiven}
            </Typography>
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
          <UseAbilityForm
            ability={ability}
            user={user}
            userOwnsAbility={userOwnsAbility}
          />
        </Paper>
      </div>
    </MainContainer>
  );
}
