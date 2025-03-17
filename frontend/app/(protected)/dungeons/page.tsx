import MainContainer from "@/components/MainContainer";
import React from "react";
import Enemy from "./_components/Enemy";

async function DungeonPage() {
  return (
    <MainContainer>
      <h1 className="text-4xl text-center mt-10">The Dungeons</h1>
      <Enemy />
    </MainContainer>
  );
}

export default DungeonPage;
