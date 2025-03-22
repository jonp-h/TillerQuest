import { getGameLeaderboard } from "@/data/games/game";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@mui/material";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { JsonValue } from "@prisma/client/runtime/library";

interface GameLeaderboardProps {
  user: {
    name: string | null;
    lastname: string | null;
    username: string | null;
    title: string | null;
    image: string | null;
  };
  score: number;
  metadata: JsonValue;
}

async function GameLeaderboard({ gameName }: { gameName: string }) {
  const users = await getGameLeaderboard(gameName);

  return (
    <div className="flex flex-col text-center">
      <h1 className="text-3xl">Top 10 Leaderboard {gameName}</h1>
      <TableContainer
        sx={{ maxWidth: "50vw" }}
        component={Paper}
        elevation={2}
        className="p-3 my-2"
      >
        <Table aria-label="leaderboard">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={2}>
                User
              </TableCell>
              <TableCell align="center">Score</TableCell>
              {users.length > 0 &&
                //   eslint-disable-next-line @typescript-eslint/no-explicit-any
                Object.keys(users[0].metadata as Record<string, any>).map(
                  (key) => (
                    <TableCell align="center" key={key}>
                      {key}
                    </TableCell>
                  ),
                )}
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user: GameLeaderboardProps) => (
              <TableRow
                key={user.score}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="center">
                  <Link href={"/profile/" + user.user.username}>
                    <div className="flex justify-center w-28 h-28 m-auto self-center from-zinc-600 to-zinc-700 bg-radial p-1.5 rounded-full">
                      <Image
                        className="rounded-full"
                        draggable="false"
                        src={"/classes/" + user.user.image + ".png"}
                        alt={user.user.username || "User"}
                        width={100}
                        height={100}
                      />
                    </div>
                  </Link>
                </TableCell>
                <TableCell sx={{ fontSize: "125%" }} align="center">
                  <Link
                    key={user.user.username}
                    href={"/profile/" + user.user.username}
                  >
                    <div className="flex flex-col text-purple-400 text-center text-lg items-center ">
                      <Typography variant="overline" color="primary">
                        {user.user.title}
                      </Typography>
                      <Typography>{user.user.name}</Typography>
                      <Typography variant="h6" color="Highlight">
                        &quot;{user.user.username}&quot;
                      </Typography>
                      <Typography>{user.user.lastname}</Typography>
                    </div>
                  </Link>
                </TableCell>
                <TableCell
                  sx={{ fontSize: "125%", color: "lightgreen" }}
                  align="center"
                >
                  {user.score}
                </TableCell>

                {user.metadata &&
                  Object.keys(user.metadata).map((key) => (
                    <TableCell align="center" key={key}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(user.metadata as Record<string, any>)[key]}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default GameLeaderboard;
