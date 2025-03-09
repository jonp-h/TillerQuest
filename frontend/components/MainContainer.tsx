import { Paper } from "@mui/material";
import React from "react";

export default function MainContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Paper id="main-container" className="pt-24 min-h-screen" elevation={1}>
      <div
        id="dice-canvas"
        className="absolute pt-24 z-10 inset-0 w-full h-full pointer-events-none"
      />

      {children}
    </Paper>
  );
}
