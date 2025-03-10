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
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Class, SchoolClass } from "@prisma/client";

interface LeaderboardUser {
  image: string | null;
  title: string | null;
  name: string | null;
  guildName: string | null;
  username: string | null;
  lastname: string | null;
  schoolClass: SchoolClass | null;
  class: Class | null;
  level: number;
  xp: number;
}

interface LeaderboardProps {
  users: LeaderboardUser[] | null;
  title: string;
}

async function Leaderboard({ users, title }: LeaderboardProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-3xl">Top 10 Leaderboard {title}</h1>
      <TableContainer component={Paper} elevation={2} className="p-3 my-2">
        <Table sx={{ minWidth: 650 }} aria-label="leaderboard">
          <TableHead>
            <TableRow>
              <TableCell align="center">User</TableCell>
              <TableCell align="center">XP</TableCell>
              <TableCell align="center">Class</TableCell>
              <TableCell align="center">Level</TableCell>
              <TableCell align="center">Guild</TableCell>
              <TableCell align="center">Schoolclass</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user: LeaderboardUser) => (
              <TableRow
                key={user.username}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="right">
                  <Link key={user.username} href={"/profile/" + user.username}>
                    <div className="flex text-purple-400 text-center text-lg items-center gap-2">
                      <div className="flex justify-center self-center from-zinc-600 to-zinc-700 bg-radial p-1.5 rounded-full">
                        <Image
                          className="rounded-full"
                          draggable="false"
                          src={"/classes/" + user.image + ".png"}
                          alt={user.username || "User"}
                          width={100}
                          height={100}
                        />
                      </div>
                      <div>
                        <Typography variant="overline" color="primary">
                          {user.title}
                        </Typography>
                        <Typography>{user.name}</Typography>
                        <Typography variant="h6" color="Highlight">
                          &quot;{user.username}&quot;
                        </Typography>
                        <Typography>{user.lastname}</Typography>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell
                  sx={{ fontSize: "125%", color: "lightgreen" }}
                  align="center"
                >
                  {user.xp}
                </TableCell>
                <TableCell sx={{ fontSize: "125%" }} align="center">
                  {user.class}
                </TableCell>
                <TableCell sx={{ fontSize: "125%" }} align="center">
                  {user.level}
                </TableCell>
                <TableCell sx={{ fontSize: "125%" }} align="center">
                  {user.guildName}
                </TableCell>
                <TableCell sx={{ fontSize: "125%" }} align="center">
                  {user.schoolClass?.split("_")[1]}
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
