import MainContainer from "@/components/MainContainer";

import React from "react";
import Leaderboard from "./_components/Leaderboard";
import { getVg1Leaderboard, getVg2Leaderboard } from "@/data/user/getUser";
import { getAllDeadUsers } from "@/data/admin/adminUserInteractions";
import Image from "next/image";
import { Button, Typography } from "@mui/material";
import Link from "next/link";

async function ArenaPage() {
  const usersVg1 = await getVg1Leaderboard();
  const usersVg2 = await getVg2Leaderboard();
  const deadUsers = await getAllDeadUsers();

  return (
    <MainContainer>
      <div className="flex flex-col justify-center items-center h-full">
        <h1 className="my-10 text-5xl text-red-400 text-center ">
          Arena games
        </h1>
        <Link href={"arena/games"}>
          <Button variant="contained" size="large">
            Go to arena games
          </Button>
        </Link>
        {deadUsers.length > 0 && (
          <>
            <h1 className="my-10 text-2xl text-red-400 text-center">
              The dead
            </h1>
            <div className="bg-red-900/50 lg:w-1/2 p-5 rounded-lg grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {deadUsers.map((user) => (
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
                        src={
                          user.hp !== 0
                            ? "/classes/" + user.image + ".png"
                            : "/classes/Grave.png"
                        }
                        alt={user.username || "Guild user"}
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
        <div className="flex flex-col mt-10 max-w-2/3 gap-3 justify-center xl:flex-row">
          <Leaderboard title={"Vg1"} users={usersVg1} />
          <Leaderboard title={"Vg2"} users={usersVg2} />
        </div>
      </div>
    </MainContainer>
  );
}

export default ArenaPage;
