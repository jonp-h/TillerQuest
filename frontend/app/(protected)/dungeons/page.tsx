import MainContainer from "@/components/MainContainer";
import React from "react";
import Battleground from "./_components/Battleground";
import { getDungeonAbilities } from "@/data/dungeons/dungeonAbilities";
import { auth } from "@/auth";

async function DungeonPage() {
  const session = await auth();
  if (
    !session ||
    (session?.user.role !== "USER" && session?.user.role !== "ADMIN")
  ) {
    throw new Error("Not authorized");
  }

  const dungeonAbilities = (await getDungeonAbilities(session.user.id!)) ?? [];
  return (
    <MainContainer>
      <h1 className="text-4xl text-center mt-10">The Dungeons</h1> <br />
      <h1 className="text-3xl text-center mb-5 text-red-500">BETA</h1>
      <Battleground abilities={dungeonAbilities} />
    </MainContainer>
  );
}

export default DungeonPage;
