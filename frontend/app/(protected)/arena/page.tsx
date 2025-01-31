import MainContainer from "@/components/MainContainer";

import React from "react";
import Leaderboard from "./_components/Leaderboard";

function ArenaPage() {
  return (
    <MainContainer>
      <div className="flex flex-col justify-center items-center h-full">
        <h1 className="my-10 text-5xl text-red-400">Arena games coming soon</h1>
        <Leaderboard />
      </div>
    </MainContainer>
  );
}

export default ArenaPage;
