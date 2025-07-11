import MainContainer from "@/components/MainContainer";
import React from "react";
import Battleground from "./_components/Battleground";
import { getDungeonAbilities } from "@/data/dungeons/dungeonAbilities";
import { getEnemies, getUserTurns } from "@/data/dungeons/dungeon";
import { requireActiveUser } from "@/lib/redirectUtils";

async function DungeonPage() {
  const session = await requireActiveUser();

  if (!session?.user.id) {
    throw new Error("User error");
  }

  const dungeonAbilities = await getDungeonAbilities(session.user.id);
  const enemies = await getEnemies(session.user.id);
  const userTurns = await getUserTurns(session.user.id);

  return (
    <MainContainer>
      <h1 className="text-4xl text-center mt-10">The Dungeons</h1> <br />
      <h1 className="text-3xl text-center mb-5 text-red-500">BETA</h1>
      {enemies ? (
        <Battleground
          abilities={dungeonAbilities ?? []}
          userId={session.user.id}
          enemies={enemies}
          userTurns={userTurns}
        />
      ) : (
        <h1 className="text-3xl text-center mb-5 text-red-500">
          You search the dungeons, but find nothing...
        </h1>
      )}
    </MainContainer>
  );
}

export default DungeonPage;
