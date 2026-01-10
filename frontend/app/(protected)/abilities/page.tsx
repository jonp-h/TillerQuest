import MainContainer from "@/components/MainContainer";
import { Typography } from "@mui/material";
import { notFound } from "next/navigation";
import AbilityTabs from "./_components/AbilityTabs";
import { RootAbilities, UserAbilities } from "./_components/interfaces";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import { Class } from "@tillerquest/prisma/browser";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";

export default async function AbilitiesPage() {
  const session = await redirectIfNotActiveUser();

  if (!session?.user) {
    return notFound();
  }

  const abilities = await secureGet<RootAbilities[]>(`/abilities/hierarchy`);

  if (!abilities.ok) {
    return ErrorAlert({ message: abilities.error });
  }

  const userAbilities = await secureGet<UserAbilities[]>(
    `/users/${session.user.id}/abilities`,
  );

  if (!userAbilities.ok) {
    return ErrorAlert({ message: userAbilities.error });
  }

  return (
    <MainContainer>
      <Typography className="text-center" variant="h1">
        Abilities
      </Typography>
      <AbilityTabs
        userClass={session?.user.class as Class}
        rootAbilities={abilities.data as RootAbilities[]}
        userAbilities={userAbilities.data}
      />
    </MainContainer>
  );
}
