import MainContainer from "@/components/MainContainer";
import { getAllCosmicEvents } from "@/data/admin/cosmic";
import { Typography } from "@mui/material";
import React from "react";
import RerollCosmic from "./_components/RerollCosmic";

export default async function CosmicPage() {
  const cosmicEvents = await getAllCosmicEvents();

  return (
    <MainContainer>
      <Typography variant="h1" align="center">
        Cosmic Events
      </Typography>
      <RerollCosmic cosmicEvents={cosmicEvents} />
    </MainContainer>
  );
}
