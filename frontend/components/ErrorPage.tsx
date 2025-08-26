import { Button, Paper, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";

export default function ErrorPage({
  text,
  redirectLink,
}: {
  text: string;
  redirectLink: string;
}) {
  return (
    <Paper
      id="main-container"
      className="text-center pt-52 min-h-screen"
      elevation={1}
    >
      <Image
        src="/Error.png"
        alt="Error"
        width={300}
        height={300}
        className="rounded-full mx-auto mb-4"
      />
      <Typography variant="h3" component="h1" gutterBottom>
        Error
      </Typography>
      <Typography variant="body1" component="p" gutterBottom>
        {text}
      </Typography>
      <Button variant="contained" color="primary" href={redirectLink}>
        Return to safety!
      </Button>
    </Paper>
  );
}
