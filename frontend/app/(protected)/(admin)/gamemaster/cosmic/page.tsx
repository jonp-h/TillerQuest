import MainContainer from "@/components/MainContainer";
import { getAllCosmicEvents, randomCosmic } from "@/data/admin";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import RerollCosmic from "./_components/RerollCosmic";

export default async function CosmicPage() {
  const cosmicEvents = await getAllCosmicEvents();

  return (
    <MainContainer>
      <Typography variant="h1" align="center">
        Cosmic Events
      </Typography>
      <RerollCosmic />
      <div className="m-auto w-2/3 mt-5">
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Description</TableCell>
                <TableCell align="right">Presetdate</TableCell>
                <TableCell align="right">Occurrences</TableCell>
                <TableCell align="right">Frequency</TableCell>
                {/* <TableCell align="right">Ability</TableCell>
            <TableCell align="right">Passive</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {cosmicEvents.map((cosmic) => (
                <TableRow
                  key={cosmic.name}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    ":hover": { cursor: "pointer" },
                    backgroundColor: cosmic.selected ? "darkviolet" : "inherit",
                  }}
                >
                  <TableCell component="th" scope="row">
                    {cosmic.name}
                  </TableCell>
                  <TableCell align="right">{cosmic.description}</TableCell>
                  <TableCell align="right">
                    {cosmic.presetDate?.toDateString()}
                  </TableCell>
                  <TableCell align="right">{cosmic.occurrences}</TableCell>
                  <TableCell align="right">{cosmic.frequency}</TableCell>
                  {/* <TableCell align="right">{cosmic.}</TableCell>
              <TableCell align="right">{cosmic.}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </MainContainer>
  );
}
