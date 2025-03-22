import MainContainer from "@/components/MainContainer";
import React from "react";
import GameForm from "./_components/GameForm";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getUserById } from "@/data/user/getUser";
import GameLeaderboard from "./_components/GameLeaderboard";

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
      <div className="flex justify-center">
        <GameLeaderboard gameName="TypeQuest" />
      </div>
    </MainContainer>
  );
}

export default Games;
