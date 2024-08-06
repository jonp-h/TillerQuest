import { Paper, Typography } from "@mui/material";
import React from "react";

interface MainContainerProps {
  heading: string;
  children: React.ReactNode;
}

export default function MainContainer({
  heading,
  children,
}: MainContainerProps) {
  return (
    <Paper className="pt-28 min-h-screen" elevation={1}>
      <Paper className="m-0 lg:mx-14" elevation={2}>
        <Typography variant="h3" align="center">
          {heading}
        </Typography>
        {children}
      </Paper>
    </Paper>
  );
}
