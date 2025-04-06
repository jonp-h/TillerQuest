import MainContainer from "@/components/MainContainer";
import React from "react";
import Battleground from "./_components/Battleground";

async function DungeonPage() {
  return (
    <MainContainer>
      <h1 className="text-4xl text-center mt-10">The Dungeons</h1>
      <Battleground />
    </MainContainer>
  );
}

export default DungeonPage;
