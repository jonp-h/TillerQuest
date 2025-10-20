import { Button, Paper, Tooltip, Typography } from "@mui/material";
import { AbilityGridProps } from "./interfaces";
import { Ability } from "@prisma/client";
import Image from "next/image";

function AbilityGrid({ abilities, onAbilityRoll, disabled }: AbilityGridProps) {
  return (
    <>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: 2 / 10,
          marginX: "auto",
          marginY: 3,
          padding: 5,
        }}
      >
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
                  {ability.name.replace(/-/g, " ")}
                </Button>
              </div>
            </Tooltip>
          ))
        ) : (
          <Typography color="error" align="center">
            You do not have any abilities.
          </Typography>
        )}
      </Paper>
    </>
  );
}

export default AbilityGrid;
