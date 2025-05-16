import MainContainer from "@/components/MainContainer";
import React from "react";
import Battleground from "./_components/Battleground";
import AbilityGrid from "./_components/AbilityGrid";

async function DungeonPage() {
  return (
    <MainContainer>
      <h1 className="text-4xl text-center mt-10">The Dungeons</h1> <br />
      <h1 className="text-3xl text-center mb-5 text-red-500">BETA</h1>
      <Battleground />
      <AbilityGrid />
    </MainContainer>
  );
}

export default DungeonPage;
