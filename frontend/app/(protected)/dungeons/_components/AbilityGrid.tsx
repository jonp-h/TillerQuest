import React from "react";
import { Button } from "@mui/material";
import { AbilityGridProps } from "./interfaces";

function AbilityGrid({ abilities, onAbilityRoll }: AbilityGridProps) {
  return (
    <>
      <div className="flex flex-col gap-3 bg-slate-800 border-2 w-2/10 border-slate-800 rounded-lg p-5">
        {abilities.map((ability) => (
          <Button
            onClick={() => onAbilityRoll && onAbilityRoll(ability)}
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
