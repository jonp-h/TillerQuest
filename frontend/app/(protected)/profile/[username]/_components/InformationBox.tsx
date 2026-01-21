import { UserProfile } from "./types";
import { Box, Button, Paper, Typography } from "@mui/material";
import Link from "next/link";
import { JSX } from "react";
import { secureGet } from "@/lib/secureFetch";
import { CosmicEvent, Notification } from "@tillerquest/prisma/browser";
import NotificationBox from "../../../../../components/Notification";
import ErrorAlert from "@/components/ErrorAlert";

export default async function InformationBox({
  user,
}: {
  user: UserProfile;
}): Promise<JSX.Element> {
  const cosmic = await secureGet<CosmicEvent>(
    `/cosmics/events?schoolClass=${user.schoolClass}`,
  );
  const notifications = await secureGet<Notification[]>(
    `/notifications/${user.id}`,
  );
  if (!notifications.ok) {
    return <ErrorAlert message={notifications.error} />;
  }

  // Server-side component: date-time check
  const currentDate = new Date();
  const isWeekend = () => {
    const dayOfWeek = currentDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const sameDay =
    new Date(user.lastMana ?? "").toISOString().slice(0, 10) ===
    currentDate.toISOString().slice(0, 10);

  return (
    <>
      {/* Render system messages if they exist and the user has not read them yet */}
      {notifications.data.map((message) => (
        <NotificationBox key={message.id} message={message} userId={user.id} />
      ))}
      {/* User is eligible for mana if the user has not received mana today, and it is not weekend  */}
      {!sameDay && !isWeekend() && (
        <Paper
          elevation={4}
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
      {cosmic.ok && cosmic.data && (
        <Paper
          elevation={4}
          className="m-3 p-5 flex flex-col gap-5 text-center justify-center"
        >
          <Typography variant="h4" align="center">
            Daily Cosmic:{" "}
            <Box
              component={"span"}
              color={"success.main"}
              style={{ fontWeight: "bold" }}
            >
              {cosmic.data.name.replace(/-/g, " ")}
            </Box>
          </Typography>
          <Typography variant="h6" align="center">
            {cosmic.data.description}
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary">
            {cosmic.data.triggerAtNoon ? "Can be avoided before 11:20" : ""}
          </Typography>
        </Paper>
      )}
    </>
  );
}
