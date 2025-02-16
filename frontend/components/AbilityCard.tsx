import { Paper, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";
import Image from "next/image";

interface AbilityProps {
  ability: {
    id: string;
    userId: string;
    abilityName: string;
  } | null;
}

export default function AbilityCard({ ability }: AbilityProps) {
  return (
    <div className="flex flex-col justify-center" key={ability?.abilityName}>
      <Link href={"/abilities/" + ability?.abilityName} passHref>
        <div className="flex flex-col items-center text-center gap-2">
          <Paper
            elevation={10}
            sx={{
              minHeight: "8rem",
              minWidth: "8rem",
              borderRadius: "9999px",
              transition: "transform 0.3s ease-in-out",
            }}
            className="flex flex-col justify-center text-center items-center p-2 hover:scale-110"
          >
            <Image
              className="rounded-full border-slate-700 border-2"
              src={"/abilities/" + ability?.abilityName + ".png"}
              alt={""}
              draggable={false}
              width={120}
              height={120}
            />
          </Paper>
          <Typography variant="subtitle1">
            {ability?.abilityName.replace(/-/g, " ")}
          </Typography>
        </div>
      </Link>
    </div>
  );
}
