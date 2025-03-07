import { getCosmic } from "@/data/cosmic/getCosmic";
import { WaterDrop } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import { User } from "@prisma/client";
import Link from "next/link";
import React, { JSX } from "react";

export default async function InformationBox({
  user,
}: {
  user: User;
}): Promise<JSX.Element> {
  const cosmic = await getCosmic();

  // Server-side component: date-time check
  const currentDate = new Date();
  const isWeekend = () => {
    const dayOfWeek = currentDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const sameDay =
    user.lastMana.toISOString().slice(0, 10) ===
    currentDate.toISOString().slice(0, 10);

  return (
    <>
      {/* User is eligible for mana if the user has not recieved mana today, and it is not weekend  */}
      {!sameDay && !isWeekend() && (
        <Paper
          elevation={6}
          className="m-3 p-5 flex gap-5 text-center justify-center"
        >
          <Typography variant="h5" align="center">
            You sense magic in the air
          </Typography>
          <Link href="/mana">
            <Button variant="contained" color="primary">
              Get mana
            </Button>
          </Link>
        </Paper>
      )}
      {cosmic && (
        <Paper
          elevation={6}
          className="m-3 p-5 flex flex-col gap-5 text-center justify-center"
        >
          <Typography variant="h4" align="center">
            <strong>Cosmic: </strong> {cosmic.name}
          </Typography>
          <Typography variant="h6" align="center">
            {cosmic.description}
          </Typography>
        </Paper>
      )}
    </>
  );
}
