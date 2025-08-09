import React from "react";
import { Button, Tooltip } from "@mui/material";
import { AbilityGridProps } from "./interfaces";
import { Ability } from "@prisma/client";
import Image from "next/image";

function AbilityGrid({ abilities, onAbilityRoll, disabled }: AbilityGridProps) {
  return (
    <>
      <div className="flex flex-col mx-auto my-3 gap-3 bg-slate-800 border-2 w-2/10 border-slate-800 rounded-lg p-5">
        {abilities && abilities.length > 0 ? (
          abilities.map((ability: Ability) => (
            <Tooltip title={ability.description} key={ability.name}>
              <div className="mx-auto">
                <Button
                  onClick={() => onAbilityRoll && onAbilityRoll(ability)}
                  variant="contained"
                  className="text-white mb-2"
                  disabled={disabled}
                  startIcon={
                    <Image
                      src={"/abilities/" + ability.icon}
                      alt={ability.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  }
                >
                  {ability.name}
                </Button>
              </div>
            </Tooltip>
          ))
        ) : (
          <p className="text-center">You do not have any abilities.</p>
        )}
      </div>
    </>
  );
}

export default AbilityGrid;
