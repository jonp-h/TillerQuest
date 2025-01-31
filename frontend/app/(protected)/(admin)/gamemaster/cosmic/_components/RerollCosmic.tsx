"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { CosmicEvent } from "@prisma/client";
import { randomCosmic, setSelectedCosmic } from "@/data/admin/cosmic";
import { resurrectUsers } from "@/data/admin/resurrectUser";
import DiceBox from "@3d-dice/dice-box";

export default function RerollCosmic() {
  const [cosmicEvent, setCosmicEvent] = useState<CosmicEvent | null>(null);

  const handleReroll = async () => {
    const cosmic = await randomCosmic();
    if (cosmic) setCosmicEvent(cosmic);
  };

  return (
    <div className="flex flex-col justify-center w-2/3 m-auto">
      <Button variant="contained" color="error" onClick={() => handleReroll()}>
        Reroll
      </Button>
      {cosmicEvent && (
        <Card>
          <CardContent className="flex flex-col items-center gap-5">
            <Typography variant="h4" align="center">
              <strong>Cosmic: </strong> {cosmicEvent?.name}
            </Typography>
            <Typography variant="h6" align="center">
              {cosmicEvent?.description}
            </Typography>
            <Button
              className="w-30"
              variant="contained"
              onClick={() => setSelectedCosmic(cosmicEvent?.name)}
            >
              Select cosmic
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
