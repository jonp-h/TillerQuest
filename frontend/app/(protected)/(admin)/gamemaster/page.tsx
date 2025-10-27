import MainContainer from "@/components/MainContainer";
import { getDeadUserCount } from "@/data/user/getUser";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import {
  AutoAwesome,
  BarChart,
  Bolt,
  Castle,
  Edit,
  Groups,
  Info,
  Message,
  Settings,
  Star,
} from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import Link from "next/link";

export default async function GameMasterPage() {
  await redirectIfNotAdmin();
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
      <div className="flex flex-col items-center mt-10 gap-5">
        <Typography variant="h3" align="center" className="mt-10">
          Actions
        </Typography>
        <div className="flex justify-center gap-10">
          <Link href="/gamemaster/cosmic">
            <Button color="success" variant="contained" startIcon={<Star />}>
              Cosmic
            </Button>
          </Link>
          <Link href="/gamemaster/powers">
            <Button color="success" variant="contained" startIcon={<Bolt />}>
              GM powers
            </Button>
          </Link>
        </div>
        <Typography variant="h3" align="center" className="mt-10">
          Edit
        </Typography>
        <div className="flex justify-center gap-10">
          <Link href="/gamemaster/users">
            <Button color="secondary" variant="contained" startIcon={<Edit />}>
              Users
            </Button>
          </Link>
          <Link href="/gamemaster/guilds">
            <Button
              color="secondary"
              variant="contained"
              startIcon={<Groups />}
            >
              Guilds
            </Button>
          </Link>
          <Link href="/gamemaster/dungeons">
            <Button
              color="secondary"
              variant="contained"
              startIcon={<Castle />}
            >
              Dungeons
            </Button>
          </Link>
          <Link href="/gamemaster/gameSettings">
            <Button
              color="secondary"
              variant="contained"
              startIcon={<Settings />}
            >
              Gamesettings
            </Button>
          </Link>
          <Link href="/gamemaster/wishingWell">
            <Button
              color="secondary"
              variant="contained"
              startIcon={<AutoAwesome />}
            >
              Wishing well
            </Button>
          </Link>
        </div>
        <Typography variant="h3" align="center" className="mt-10">
          System
        </Typography>
        <div className="flex justify-center gap-10">
          <Link href="/gamemaster/log">
            <Button color="info" variant="contained" startIcon={<Info />}>
              Log
            </Button>
          </Link>
          <Link href="/gamemaster/systemMessages">
            <Button color="info" variant="contained" startIcon={<Message />}>
              System messages
            </Button>
          </Link>
          <Link href="/gamemaster/analytics">
            <Button color="info" variant="contained" startIcon={<BarChart />}>
              Analytics
            </Button>
          </Link>
        </div>
      </div>
    </MainContainer>
  );
}
