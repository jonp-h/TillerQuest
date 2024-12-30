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
        <Paper elevation={10} className="text-center items-center p-2">
          <div className="flex justify-center">
            <Image
              className="rounded-full border-slate-700 border-2"
              src={"/abilities/" + ability?.abilityName + ".jpg"}
              alt={ability?.abilityName ?? "ability"}
              draggable={false}
              width={50}
              height={50}
            />
          </div>
          <Typography variant="h6">
            {ability?.abilityName.replace("-", " ")}
          </Typography>
        </Paper>
      </Link>
    </div>
  );
}
