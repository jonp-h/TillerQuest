"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { CosmicEvent } from "@prisma/client";
import { randomCosmic, setSelectedCosmic } from "@/data/admin/cosmic";
import { resurrectUsers } from "@/data/admin/resurrectUser";
import DiceBox from "@3d-dice/dice-box";
import { useRouter } from "next/navigation";

export default function RerollCosmic({
  cosmicEvents,
}: {
  cosmicEvents: CosmicEvent[];
}) {
  const [cosmicEvent, setCosmicEvent] = useState<CosmicEvent | null>(null);

  const router = useRouter();

  const handleReroll = async () => {
    const cosmic = await randomCosmic();
    if (cosmic) setCosmicEvent(cosmic);
  };

  const handleSetSelectedCosmic = async (name: string) => {
    await setSelectedCosmic(name).then(() => {
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex flex-col justify-center w-2/3 m-auto">
        <Button
          variant="contained"
          color="error"
          onClick={() => handleReroll()}
        >
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
                onClick={() => handleSetSelectedCosmic(cosmicEvent?.name)}
              >
                Select cosmic
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="m-auto w-2/3 mt-5">
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Description</TableCell>
                <TableCell align="right">Presetdate</TableCell>
                <TableCell align="right">Automatic</TableCell>
                <TableCell align="right">Blocks abilities of type</TableCell>
                <TableCell align="right">Triggers at 11:20</TableCell>
                <TableCell align="right">Grants the users an ability</TableCell>
                <TableCell align="right">Linked ability</TableCell>
                <TableCell align="right">Increases cost</TableCell>
                <TableCell align="right">Occurrences</TableCell>
                <TableCell align="right">Frequency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cosmicEvents.map((cosmic) => (
                <TableRow
                  key={cosmic.name}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    backgroundColor: cosmic.selected ? "darkviolet" : "inherit",
                  }}
                >
                  <TableCell
                    onClick={() => setCosmicEvent(cosmic)}
                    sx={{ cursor: "pointer" }}
                    component="th"
                    scope="row"
                  >
                    {cosmic.name}
                  </TableCell>
                  <TableCell align="right">{cosmic.description}</TableCell>
                  <TableCell align="right">
                    {cosmic.presetDate?.toDateString()}
                  </TableCell>
                  <TableCell align="right">{cosmic.automatic}</TableCell>
                  <TableCell align="right">{cosmic.blockAbilityType}</TableCell>
                  <TableCell align="right">{cosmic.triggerAtNoon}</TableCell>
                  <TableCell align="right">{cosmic.grantAbility}</TableCell>
                  <TableCell align="right">{cosmic.abilityName}</TableCell>
                  <TableCell align="right">
                    {cosmic.increaseCostType +
                      ": " +
                      cosmic.increaseCostValue +
                      "%"}
                  </TableCell>
                  <TableCell align="right">{cosmic.occurrences}</TableCell>
                  <TableCell align="right">{cosmic.frequency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}
