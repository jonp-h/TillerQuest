import MainContainer from "@/components/MainContainer";
import React from "react";
import Battleground from "./_components/Battleground";
import { getDungeonAbilities } from "@/data/dungeons/dungeonAbilities";
import { auth } from "@/auth";

async function DungeonPage() {
  const user = await auth();

  if (!user?.user.id) {
    throw new Error("User ID is required to fetch dungeon abilities.");
  }
  const dungeonAbilities = await getDungeonAbilities(user.user.id);
  return (
    <MainContainer>
      <h1 className="text-4xl text-center mt-10">The Dungeons</h1> <br />
      <h1 className="text-3xl text-center mb-5 text-red-500">BETA</h1>
      <Battleground abilities={dungeonAbilities ?? []} />
    </MainContainer>
  );
}

export default DungeonPage;
