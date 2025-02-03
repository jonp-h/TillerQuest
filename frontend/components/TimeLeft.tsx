"use client";
import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

export default function TimeLeft({ endTime }: { endTime: Date }) {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const getTime = () => {
      const time = endTime.getTime() - Date.now();

      setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
      setMinutes(Math.floor((time / 1000 / 60) % 60));
    };

    const interval = setInterval(() => getTime(), 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return days + hours + minutes > 0 ? (
    <Typography variant="body1">
      {days !== 0 && days + "d"} {hours !== 0 && hours + "h"}{" "}
      {minutes !== 0 && minutes + "m"}
    </Typography>
  ) : null;
}
