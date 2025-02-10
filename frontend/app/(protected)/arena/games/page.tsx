import MainContainer from "@/components/MainContainer";
import { Button } from "@mui/material";
import React from "react";
import GameForm from "./_components/GameForm";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getUserById } from "@/data/user/getUser";

async function Games() {
  const session = await auth();

  if (!session?.user.id) {
    return notFound();
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    return notFound();
  }

  return (
    <MainContainer>
      <GameForm user={user} />
    </MainContainer>
  );
}

export default Games;
