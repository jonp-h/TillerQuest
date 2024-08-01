import { Paper, Typography } from "@mui/material";
import React from "react";

export default function MainContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Paper className="pt-24 min-h-screen" elevation={1}>
      {children}
    </Paper>
  );
}