import MainContainer from "@/components/MainContainer";
import { Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import AbilityTree from "./AbilityTree";
import { getAbilityHierarchy, getOwnedAbilities } from "@/data/abilities";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import AbilityTabs from "./AbilityTabs";

export default async function AbilitiesPage() {
  const user = await auth();

  const abilities = await getAbilityHierarchy();
  if (user?.user.id == undefined) {
    return notFound();
  }
  const userAbilities = await getOwnedAbilities(user?.user?.id);

  return (
    <MainContainer>
      <Typography className="text-center" variant="h1">
        Abilities
      </Typography>
      <AbilityTabs rootAbilities={abilities} userAbilities={userAbilities} />
    </MainContainer>
  );
}
