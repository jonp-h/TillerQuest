import MainContainer from "@/components/MainContainer";
import { Typography } from "@mui/material";
import React from "react";
import {
  getAbilityHierarchy,
  getUserAbilities,
} from "@/data/abilities/getters/getAbilities";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import AbilityTabs from "./_components/AbilityTabs";

export default async function AbilitiesPage() {
  const user = await auth();

  const abilities = await getAbilityHierarchy();
  if (user?.user.id == undefined) {
    return notFound();
  }

  const userAbilities = await getUserAbilities(user?.user?.id);

  return (
    <MainContainer>
      <Typography className="text-center" variant="h1">
        Abilities
      </Typography>
      <AbilityTabs
        userClass={user.user.class}
        rootAbilities={abilities}
        userAbilities={userAbilities}
      />
    </MainContainer>
  );
}
