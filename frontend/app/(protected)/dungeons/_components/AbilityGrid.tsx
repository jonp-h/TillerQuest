import React from "react";
import { auth } from "@/auth";
import { getDungeonAbilities } from "@/data/dungeons/dungeonAbilities";
import { notFound } from "next/navigation";
import { Button } from "@mui/material";
import { Ability } from "@prisma/client";
import { useDungeonAbility } from "@/data/dungeons/dungeon";

async function AbilityGrid() {
  const session = await auth();

  const userId = session?.user.id;
  if (userId === undefined) {
    return notFound();
  }
  const abilities = await getDungeonAbilities(userId);

  const useAbility = (ability: Ability) => {
    useDungeonAbility(userId, ability);
  };
  if (!abilities) {
    return notFound();
  }

  console.log(abilities);
  return (
    <>
      <div className="flex flex-col gap-3 bg-slate-800 border-2 w-2/10 border-slate-800 rounded-lg p-5">
        {abilities.map((ability) => (
          <Button
            onClick={() => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useAbility(ability);
            }}
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
