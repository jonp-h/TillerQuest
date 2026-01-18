import MainContainer from "@/components/MainContainer";
import Leaderboard from "./_components/Leaderboard";
import Image from "next/image";
import { Button, Typography } from "@mui/material";
import Link from "next/link";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import { secureGet } from "@/lib/secureFetch";
import { DeadUser, Leaderboards } from "./_components/types";

async function ArenaPage() {
  await redirectIfNotActiveUser();
  const leaderboards = await secureGet<Leaderboards>("/users/leaderboards");
  const deadUsers = await secureGet<DeadUser[]>("/users/dead");

  return (
    <MainContainer>
      <div className="flex flex-col justify-center items-center h-full">
        <Typography variant="h1" sx={{ marginY: 4 }}>
          Arena
        </Typography>
        <Link href={"arena/games"}>
          <Button variant="contained" size="large">
            Go to the arena games
          </Button>
        </Link>
        <div className="flex flex-col mt-10 max-w-2/3 gap-3 justify-center xl:flex-row">
          <Link href={"arena/valhalla"}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                background:
                  "linear-gradient(90deg, #FFD700 0%, #FF8C00 25%, #FF1493 50%, #00BFFF 75%, #FFD700 100%)",

                boxShadow:
                  "0 4px 20px 0 rgba(255, 105, 180, 0.3), 0 2px 4px 0 rgba(0,191,255,0.15)",
                backgroundSize: "300% 100%",
                backgroundPosition: "0% 0%",
                transition:
                  "background-position 0.7s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s",
                letterSpacing: 2,
                "&:hover": {
                  backgroundPosition: "100% 0%",
                  boxShadow:
                    "0 6px 30px 0 rgba(255, 20, 147, 0.4), 0 4px 8px 0 rgba(0,191,255,0.25)",
                },
              }}
            >
              Legendary players
            </Button>
          </Link>
        </div>
        {deadUsers.ok && deadUsers.data.length > 0 && (
          <>
            <Typography variant="h2" sx={{ marginY: 5 }} color="error">
              The dead
            </Typography>
            <div className="bg-red-900/50 lg:w-1/2 p-5 rounded-lg grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {deadUsers.data.map((user) => (
                <Link key={user.id} href={"/profile/" + user.username}>
                  <div className="flex flex-col items-center">
                    <div
                      className={
                        "from-red-600 to-red-700 bg-radial p-1.5 rounded-full"
                      }
                    >
                      <Image
                        className="rounded-full"
                        draggable="false"
                        src={"/classes/Grave.png"}
                        alt={user.username}
                        width={100}
                        height={100}
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-center mt-2">
                      <Typography variant="body1" flexWrap="wrap">
                        {user.username}
                      </Typography>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
        <div className="flex flex-col mt-10 max-w-2/3 gap-5 justify-center xl:flex-row">
          {leaderboards.ok && (
            <>
              <Leaderboard title={"Top 10 VG1"} users={leaderboards.data.vg1} />
              <Leaderboard title={"Top 10 VG2"} users={leaderboards.data.vg2} />
            </>
          )}
        </div>
      </div>
    </MainContainer>
  );
}

export default ArenaPage;
