import React from "react";
import { auth } from "@/auth";
import { getDungeonAbilities } from "@/data/dungeons/dungeonAbilities";
import { notFound } from "next/navigation";
import { Button } from "@mui/material";

async function AbilityGrid() {
  const session = await auth();

  const userId = session?.user.id;
  if (userId === undefined) {
    return notFound();
  }

  const abilities = await getDungeonAbilities(userId);

  if (!abilities) {
    return notFound();
  }

  console.log(abilities);
  return (
    <>
      <div className="flex flex-col gap-3 bg-slate-800 border-2 w-2/10 border-slate-800 rounded-lg p-5">
        {abilities.map((ability) => (
          <Button
            key={ability.name}
            variant="contained"
            className="  text-white mb-2"
          >
            {ability.name}
          </Button>
        ))}
      </div>
    </>
  );
}

export default AbilityGrid;
