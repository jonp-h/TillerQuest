import React from "react";
import { Button } from "@mui/material";
import { AbilityGridProps } from "./interfaces";
import { Ability } from "@prisma/client";

function AbilityGrid({ abilities, onAbilityRoll, disabled }: AbilityGridProps) {
  return (
    <>
      <div className="flex flex-col mx-auto my-3 gap-3 bg-slate-800 border-2 w-2/10 border-slate-800 rounded-lg p-5">
        {abilities && abilities.length > 0 ? (
          abilities.map((ability: Ability) => (
            <Button
              onClick={() => onAbilityRoll && onAbilityRoll(ability)}
              key={ability.name}
              variant="contained"
              className="text-white mb-2"
              disabled={disabled}
            >
              {ability.name}
            </Button>
          ))
        ) : (
          <p className="text-center">You do not have any abilities.</p>
        )}
      </div>
    </>
  );
}

export default AbilityGrid;
