import MainContainer from "@/components/MainContainer";
import { Typography } from "@mui/material";
import React from "react";
import {
  getAbilityHierarchy,
  getUserAbilities,
} from "@/data/abilities/getters/getAbilities";
import { notFound } from "next/navigation";
import AbilityTabs from "./_components/AbilityTabs";
import { RootAbilities } from "./_components/interfaces";
import { $Enums } from "@prisma/client";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";

export default async function AbilitiesPage() {
  const session = await redirectIfNotActiveUser();

  const abilities = await getAbilityHierarchy();
  if (!session?.user) {
    return notFound();
  }

  const userAbilities = await getUserAbilities(session.user?.id);

  return (
    <MainContainer>
      <Typography className="text-center" variant="h1">
        Abilities
      </Typography>
      <AbilityTabs
        userClass={session?.user.class as $Enums.Class}
        rootAbilities={abilities as RootAbilities[]}
        userAbilities={userAbilities}
      />
    </MainContainer>
  );
}
