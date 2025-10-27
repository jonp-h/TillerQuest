"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
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
import { CosmicEvent } from "@prisma/client";
import {
  randomCosmic,
  setRecommendedCosmic,
  setSelectedCosmic,
} from "@/data/admin/cosmic";
import { useRouter } from "next/navigation";
import DialogButton from "@/components/DialogButton";
import { toast } from "react-toastify";
import { useState } from "react";

export default function RerollCosmic({
  cosmicEvents,
  recommendedCosmic,
  selectedCosmicEvents,
}: {
  cosmicEvents: CosmicEvent[];
  recommendedCosmic: CosmicEvent | null;
  selectedCosmicEvents: {
    vg1: CosmicEvent | null;
    vg2: CosmicEvent | null;
  };
}) {
  const [notify, setNotify] = useState(true);

  const router = useRouter();

  const handleReroll = async () => {
    const result = await randomCosmic();

    if (result.success) {
      toast.success("Rerolled cosmic!");
    } else {
      toast.error(result.error);
    }
    router.refresh();
  };

  const handleSetRecommendedCosmic = async (name: string) => {
    const result = await setRecommendedCosmic(name);

    if (result.success) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  const handleSetSelectedCosmic = async (name: string, grade: string) => {
    const result = await setSelectedCosmic(name, grade, notify);

    if (result.success) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    router.refresh();
  };

  return (
    <>
      <div className="flex flex-col justify-center w-3/4 m-auto">
        <div className="flex">
          <Card elevation={5} sx={{ width: "50%" }}>
            <CardContent className="flex flex-col items-center gap-5">
              <Typography variant="h4" align="center">
                <strong>Selected Vg1 Cosmic: </strong>
              </Typography>
              {selectedCosmicEvents.vg1 ? (
                <>
                  <Typography variant="h4" align="center" color="warning">
                    {selectedCosmicEvents.vg1?.name.replace(/-/g, " ")}
                    <Tooltip title="This number represents the number of times this cosmic event has occurred in the past for vg1.">
                      <span className="cursor-help">
                        {" (" + selectedCosmicEvents.vg1?.occurrencesVg1 + ")"}
                      </span>
                    </Tooltip>
                  </Typography>
                  <Typography variant="h6" align="center" color="textSecondary">
                    {selectedCosmicEvents.vg1?.description}
                  </Typography>
                  <Typography variant="h6" align="center" color="info">
                    {selectedCosmicEvents.vg1?.automatic
                      ? "This event will trigger automatically"
                      : "This event requires manual triggering "}
                  </Typography>
                </>
              ) : (
                <Typography variant="h4" align="center" color="warning">
                  No cosmic selected
                </Typography>
              )}
            </CardContent>
          </Card>
          <Card elevation={5} sx={{ width: "50%" }}>
            <CardContent className="flex flex-col items-center gap-5">
              <Typography variant="h4" align="center">
                <strong>Selected Vg2 Cosmic: </strong>
              </Typography>
              {selectedCosmicEvents.vg2 ? (
                <>
                  <Typography variant="h4" align="center" color="success">
                    {selectedCosmicEvents.vg2?.name.replace(/-/g, " ")}
                    <Tooltip title="This number represents the number of times this cosmic event has occurred in the past for vg2.">
                      <Box
                        component={"span"}
                        sx={{ cursor: "help" }}
                        color={"success.main"}
                      >
                        {" (" + selectedCosmicEvents.vg2?.occurrencesVg2 + ")"}
                      </Box>
                    </Tooltip>
                  </Typography>
                  <Typography variant="h6" align="center" color="textSecondary">
                    {selectedCosmicEvents.vg2?.description}
                  </Typography>
                  <Typography variant="h6" align="center" color="info">
                    {selectedCosmicEvents.vg2?.automatic
                      ? "This event will trigger automatically"
                      : "This event requires manual triggering "}
                  </Typography>
                </>
              ) : (
                <Typography variant="h4" align="center" color="success">
                  No cosmic selected
                </Typography>
              )}
            </CardContent>
          </Card>
        </div>

        {recommendedCosmic && (
          <Card elevation={3} className="mt-20">
            <CardContent className="flex flex-col items-center gap-5">
              <Typography variant="h4" align="center">
                <strong>Recommended Cosmic: </strong>
              </Typography>
              <Typography variant="h4" align="center" color="secondary">
                {recommendedCosmic?.name.replace(/-/g, " ")}
                <Tooltip title="This number represents the number of times this cosmic event has occurred in the past for vg1.">
                  <Box
                    component={"span"}
                    sx={{ cursor: "help" }}
                    color={"warning.main"}
                  >
                    {" (" + recommendedCosmic?.occurrencesVg1 + ")"}
                  </Box>
                </Tooltip>
                <Tooltip title="This number represents the number of times this cosmic event has occurred in the past for vg2.">
                  <Box
                    component={"span"}
                    sx={{ cursor: "help" }}
                    color={"success.main"}
                  >
                    {" (" + recommendedCosmic?.occurrencesVg2 + ")"}
                  </Box>
                </Tooltip>
              </Typography>
              <Typography variant="h6" align="center" color="textSecondary">
                {recommendedCosmic?.description}
              </Typography>
              <Typography variant="h6" align="center" color="info">
                {recommendedCosmic?.automatic
                  ? "This event will trigger automatically"
                  : "This event requires manual triggering"}
              </Typography>
              <div className="flex gap-5">
                <DialogButton
                  buttonText="Select cosmic for vg1"
                  dialogTitle="Confirm Selection for vg1"
                  dialogContent={
                    recommendedCosmic
                      ? "Are you sure you want to select this cosmic event for vg1? This will replace the currently selected cosmic event."
                      : "Are you sure you want to select this cosmic event for vg1? "
                  }
                  color="warning"
                  dialogFunction={() =>
                    handleSetSelectedCosmic(recommendedCosmic?.name, "vg1")
                  }
                  buttonVariant="contained"
                  agreeText="Set as daily cosmic for vg1"
                  disagreeText="Cancel"
                />
                <DialogButton
                  buttonText="Select cosmic for vg2"
                  dialogTitle="Confirm Selection for vg2"
                  dialogContent={
                    recommendedCosmic
                      ? "Are you sure you want to select this cosmic event for vg2? This will replace the currently selected cosmic event."
                      : "Are you sure you want to select this cosmic event for vg2? "
                  }
                  dialogFunction={() =>
                    handleSetSelectedCosmic(recommendedCosmic?.name, "vg2")
                  }
                  color="success"
                  buttonVariant="contained"
                  agreeText="Set as daily cosmic for vg2"
                  disagreeText="Cancel"
                />
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleReroll()}
                >
                  Reroll
                </Button>
              </div>
              <Box className="flex items-center gap-2 mt-3">
                <FormControlLabel
                  control={
                    <Checkbox
                      size="medium"
                      checked={notify}
                      color="secondary"
                      onChange={() => setNotify(!notify)}
                    />
                  }
                  label="Notify users on Discord"
                />
              </Box>
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
                <TableCell align="right">Occurrences Vg1 - Vg2</TableCell>
                <TableCell align="right">Frequency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cosmicEvents.map((cosmic) => (
                <TableRow
                  key={cosmic.name}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Button
                      variant={
                        recommendedCosmic === cosmic ||
                        selectedCosmicEvents.vg1 === cosmic ||
                        selectedCosmicEvents.vg2 === cosmic
                          ? "contained"
                          : "outlined"
                      }
                      color={
                        recommendedCosmic === cosmic
                          ? "success"
                          : selectedCosmicEvents.vg1 === cosmic
                            ? "warning"
                            : selectedCosmicEvents.vg2 === cosmic
                              ? "success"
                              : "secondary"
                      }
                      onClick={() => handleSetRecommendedCosmic(cosmic.name)}
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
                  <TableCell align="center">
                    <Box component={"span"} color={"warning.main"}>
                      {cosmic.occurrencesVg1}
                    </Box>
                    <Box component={"span"}>{" - "}</Box>
                    <Box component={"span"} color={"success.main"}>
                      {cosmic.occurrencesVg2}
                    </Box>
                  </TableCell>
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
