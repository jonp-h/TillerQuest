import MainContainer from "@/components/MainContainer";
import { getDeadUserCount } from "@/data/user/getUser";
import { requireAdmin } from "@/lib/redirectUtils";
import { Button, Paper, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

export default async function GameMasterPage() {
  await requireAdmin();
  const deadUsers = await getDeadUserCount();

  return (
    <MainContainer>
      <Typography variant="h1" align="center">
        Game Master
      </Typography>
      {deadUsers > 0 && (
        <Paper
          className="p-5 flex flex-col justify-center w-2/3 m-auto text-center gap-6"
          elevation={6}
        >
          <Typography color={"red"} variant="h3">
            Dead users: {deadUsers}
          </Typography>

          <div className="flex justify-evenly">
            <Link href={`/gamemaster/resurrect/`}>
              <Button variant="contained" color="error">
                Resurrect
              </Button>
            </Link>
          </div>
        </Paper>
      )}
      <div className="flex mt-10 justify-evenly">
        <Link href="/gamemaster/guilds">
          <Button color="secondary" variant="contained">
            Guilds
          </Button>
        </Link>
        <Link href="/gamemaster/manage">
          <Button color="secondary" variant="contained">
            Manage users
          </Button>
        </Link>
        <Link href="/gamemaster/dungeons">
          <Button color="secondary" variant="contained">
            Dungeons
          </Button>
        </Link>
        <Link href="/gamemaster/cosmic">
          <Button color="secondary" variant="contained">
            Cosmic
          </Button>
        </Link>
        <Link href="/gamemaster/users">
          <Button color="secondary" variant="contained">
            GM powers
          </Button>
        </Link>
        <Link href="/gamemaster/log">
          <Button color="secondary" variant="contained">
            Log
          </Button>
        </Link>
        <Link href="/gamemaster/systemMessages">
          <Button color="secondary" variant="contained">
            System messages
          </Button>
        </Link>
        <Link href="/gamemaster/analytics">
          <Button color="secondary" variant="contained">
            Analytics
          </Button>
        </Link>
        <Link href="/gamemaster/gameSettings">
          <Button color="secondary" variant="contained" disabled={false}>
            Gamesettings
          </Button>
        </Link>
        <Link href="/gamemaster/abilities">
          <Button color="secondary" variant="contained" disabled={true}>
            Ability management
          </Button>
        </Link>
      </div>
    </MainContainer>
  );
}
