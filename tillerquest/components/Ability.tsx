import { AutoAwesome } from "@mui/icons-material";
import { Paper, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";
import Image from "next/image";

export default function Ability(props: any) {
  return (
    <div className="flex flex-col justify-center">
      <Link href={"/abilities/" + props.ability.abilityName} passHref>
        <Paper elevation={10} className="text-center items-center p-2">
          <div className="flex justify-center">
            <Image
              className="rounded-full border-slate-700 border-2"
              src={"/abilities/" + props.ability.abilityName + ".jpg"}
              alt={props.ability.abilityName}
              draggable={false}
              width={50}
              height={50}
            />
          </div>
          <Typography variant="h6">
            {props.ability.abilityName.replace("-", " ")}
          </Typography>
        </Paper>
      </Link>
    </div>
  );
}
