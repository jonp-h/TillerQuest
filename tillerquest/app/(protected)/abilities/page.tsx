import MainContainer from "@/components/MainContainer";
import { Typography } from "@mui/material";
import React from "react";
import AbilityTree from "./AbilityTree";
import { getAbilityHierarchy, getOwnedAbilities } from "@/data/abilities";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

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

      <div className="flex flex-col justify-center gap-10">
        {abilities &&
          abilities.map((ability) => (
            <>
              <Typography className="text-center" variant="h2">
                {ability.type}
              </Typography>
              <div className="h-screen w-screen bg-slate-800">
                <AbilityTree
                  rootAbilities={ability}
                  userAbilities={userAbilities}
                />
              </div>
            </>
          ))}
      </div>
    </MainContainer>
  );
}
