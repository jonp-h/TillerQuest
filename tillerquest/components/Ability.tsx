import { AutoAwesome } from "@mui/icons-material";
import { Paper, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

export default function Ability(props: any) {
  return (
    <Link href={"/abilities/" + props.ability.abilityName} passHref>
      <Paper elevation={10} className="text-center items-center p-2">
        <Typography variant="h6">{props.ability.abilityName}</Typography>
        <AutoAwesome />
      </Paper>
    </Link>
  );
}
