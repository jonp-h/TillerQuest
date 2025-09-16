"use client";
import {
  Button,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CosmicEvent } from "@prisma/client";
import { randomCosmic, setSelectedCosmic } from "@/data/admin/cosmic";
import { useRouter } from "next/navigation";
import DialogButton from "@/components/DialogButton";
import { toast } from "react-toastify";

//FIXME: refactor this code
export default function RerollCosmic({
  cosmicEvents,
}: {
  cosmicEvents: CosmicEvent[];
}) {
  const [recommendedCosmicEvent, setRecommendedCosmicEvent] =
    useState<CosmicEvent | null>(null);
  const [selectedCosmicEvent, setSelectedCosmicEvent] =
    useState<CosmicEvent | null>(null);

  const router = useRouter();

  useEffect(() => {
    const recommendedCosmic = cosmicEvents.find((cosmic) => cosmic.recommended);
    if (recommendedCosmic) {
      setRecommendedCosmicEvent(recommendedCosmic);
    }
    const selectedCosmic = cosmicEvents.find((cosmic) => cosmic.selected);
    if (selectedCosmic) {
      setSelectedCosmicEvent(selectedCosmic);
    }
  }, [cosmicEvents]);

  const handleReroll = async () => {
    const result = await randomCosmic();

    if (result.success) {
      toast.success("Rerolled cosmic!");
      setRecommendedCosmicEvent(result.data);
    } else {
      toast.error(result.error);
    }
  };

  const handleSetSelectedCosmic = async (name: string) => {
    const result = await setSelectedCosmic(name);

    if (result.success) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  return (
    <>
      <div className="flex flex-col justify-center w-2/3 m-auto">
        {selectedCosmicEvent && (
          <Card elevation={8}>
            <CardContent className="flex flex-col items-center gap-5">
              <Typography variant="h4" align="center">
                <strong>Selected Cosmic: </strong>
              </Typography>
              <Typography variant="h4" align="center" color="primary">
                {selectedCosmicEvent?.name.replace(/-/g, " ")}
              </Typography>
              <Typography variant="h6" align="center" color="textSecondary">
                {selectedCosmicEvent?.description}
              </Typography>
              <Typography variant="h6" align="center" color="info">
                {selectedCosmicEvent?.automatic
                  ? "This event will trigger automatically"
                  : "This event requires manual triggering "}
              </Typography>
            </CardContent>
          </Card>
        )}
        {recommendedCosmicEvent && (
          <Card elevation={3} className="mt-20">
            <CardContent className="flex flex-col items-center gap-5">
              <Typography variant="h4" align="center">
                <strong>Recommended Cosmic: </strong>
              </Typography>
              <Typography variant="h4" align="center" color="primary">
                {recommendedCosmicEvent?.name.replace(/-/g, " ")}
                <Tooltip title="This number represents the number of times this cosmic event has occurred in the past.">
                  <span className="cursor-help">
                    {" (" + recommendedCosmicEvent?.occurrences + ")"}
                  </span>
                </Tooltip>
              </Typography>
              <Typography variant="h6" align="center" color="textSecondary">
                {recommendedCosmicEvent?.description}
              </Typography>
              <Typography variant="h6" align="center" color="info">
                {selectedCosmicEvent?.automatic
                  ? "This event will trigger automatically"
                  : "This event requires manual triggering"}
              </Typography>
              <div className="flex gap-5">
                <DialogButton
                  buttonText="Select cosmic"
                  dialogTitle="Confirm Selection"
                  dialogContent={
                    selectedCosmicEvent
                      ? "Are you sure you want to select this cosmic event? This will replace the currently selected cosmic event."
                      : "Are you sure you want to select this cosmic event? "
                  }
                  dialogFunction={() =>
                    handleSetSelectedCosmic(recommendedCosmicEvent?.name)
                  }
                  buttonVariant="contained"
                  agreeText="Set as daily cosmic"
                  disagreeText="Cancel"
                />
                {/* <Button
                  className="w-30"
                  variant="contained"
                  onClick={() =>
                    handleSetSelectedCosmic(recommendedCosmicEvent?.name)
                  }
                >
                  Select cosmic
                </Button> */}
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleReroll()}
                >
                  Reroll
                </Button>
              </div>
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
                  <TableCell component="th" scope="row">
                    <Button
                      variant={
                        recommendedCosmicEvent === cosmic || cosmic.selected
                          ? "contained"
                          : "outlined"
                      }
                      color={cosmic.selected ? "primary" : "secondary"}
                      onClick={() => setRecommendedCosmicEvent(cosmic)}
                    >
                      {cosmic.name.replace(/-/g, " ")}
                    </Button>
                  </TableCell>
                  <TableCell align="right">{cosmic.description}</TableCell>
                  <TableCell align="right">
                    {cosmic.presetDate?.toDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {cosmic.automatic ? "True" : "False"}
                  </TableCell>
                  <TableCell align="right">{cosmic.blockAbilityType}</TableCell>
                  <TableCell align="right">
                    {cosmic.triggerAtNoon ? "True" : "False"}
                  </TableCell>
                  <TableCell align="right">
                    {cosmic.grantAbility ? "True" : "False"}
                  </TableCell>
                  <TableCell align="right">
                    {cosmic.abilityName?.replace(/-/g, " ")}
                  </TableCell>
                  <TableCell align="right">
                    {cosmic.increaseCostType
                      ? cosmic.increaseCostType +
                        ": " +
                        cosmic.increaseCostValue +
                        "%"
                      : null}
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
