import MainContainer from "@/components/MainContainer";
import React from "react";
import Battleground from "./_components/Battleground";
import { isTurnFinished } from "@/data/games/dungeon";

async function DungeonPage() {
  const checkTurn = await isTurnFinished();
  console.log(checkTurn);
  return (
    <MainContainer>
      <h1 className="text-4xl text-center mt-10">The Dungeons</h1>
      {!checkTurn?.turnFinished ? (
        <Battleground />
      ) : (
        <p className="text-center mt-10">
          The turn is finished. Please wait for the next round.
        </p>
      )}
    </MainContainer>
  );
}

export default DungeonPage;
