import { getCosmic } from "@/data/cosmic/getCosmic";
import { UserProfile } from "@/types/users";
import { Button, Paper, Typography } from "@mui/material";
import Link from "next/link";
import React, { JSX } from "react";

export default async function InformationBox({
  user,
}: {
  user: UserProfile;
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
      <Paper
        elevation={6}
        className="m-3 p-5 flex flex-col gap-5 text-center justify-center"
        variant="outlined"
        sx={{
          backgroundColor: "salmon",
          textShadow: "2px 2px 2px black",
        }}
      >
        <Typography variant="h4" align="center">
          UPDATE: Large gameplay changes, some data has been rolled back
        </Typography>
      </Paper>
      {/* User is eligible for mana if the user has not recieved mana today, and it is not weekend  */}
      {!sameDay && !isWeekend() && (
        <Paper
          elevation={6}
          className="m-3 p-5 flex flex-col gap-5 text-center justify-center animate-pulse"
          variant="outlined"
          sx={{
            backgroundColor: "Highlight",
            animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        >
          <Typography variant="h5" align="center">
            You sense magic in the air
          </Typography>
          <Link href="/mana">
            <Button variant="contained" color="primary">
              Get daily mana
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
            Daily Cosmic:{" "}
            <strong className="text-green-400">
              {cosmic.name.replace(/-/g, " ")}
            </strong>
          </Typography>
          <Typography variant="h6" align="center">
            {cosmic.description}
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary">
            {cosmic.triggerAtNoon ? "Can be avoided before 11:20" : ""}
          </Typography>
        </Paper>
      )}
    </>
  );
}
