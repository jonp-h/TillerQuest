import MiniatureProfile from "@/components/MiniatureProfile";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getLeaderboard } from "@/data/user/getUser";
import React from "react";
import Image from "next/image";
import Link from "next/link";

async function Leaderboard() {
  const users = await getLeaderboard();

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-3xl">Top 10 Leaderboard</h1>
      <TableContainer component={Paper} elevation={2} className="p-3 my-2">
        <Table sx={{ minWidth: 1000 }} aria-label="leaderboard">
          <TableHead>
            <TableRow>
              <TableCell align="center">XP</TableCell>
              <TableCell align="center">User</TableCell>
              <TableCell align="center">Level</TableCell>
              <TableCell align="center">Class</TableCell>
              <TableCell align="center">Guild</TableCell>
              <TableCell align="center">Schoolclass</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <TableRow
                key={user.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  sx={{ fontSize: "200%", color: "lightgreen" }}
                  align="center"
                >
                  {user.xp}
                </TableCell>
                <TableCell align="right">
                  <Link key={user.username} href={"/profile/" + user.username}>
                    <div className="flex flex-col text-purple-400 text-center text-xl items-center gap-2">
                      <div className="flex justify-center self-center from-zinc-600 to-zinc-700 bg-gradient-radial p-1.5 rounded-full">
                        <Image
                          className="rounded-full"
                          draggable="false"
                          src={"/classes/" + user.image + ".png"}
                          alt={user.username || "User"}
                          width={100}
                          height={100}
                        />
                      </div>
                      {user.username}
                    </div>
                  </Link>
                </TableCell>
                <TableCell sx={{ fontSize: "150%" }} align="center">
                  {user.level}
                </TableCell>
                <TableCell sx={{ fontSize: "150%" }} align="center">
                  {user.class}
                </TableCell>
                <TableCell sx={{ fontSize: "150%" }} align="center">
                  {user.guildName}
                </TableCell>
                <TableCell sx={{ fontSize: "150%" }} align="center">
                  {user.schoolClass}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Leaderboard;
