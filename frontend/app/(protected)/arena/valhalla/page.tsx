import MainContainer from "@/components/MainContainer";
import { getValhallaUsers } from "@/data/user/getUser";
import React from "react";
import Leaderboard from "../_components/Leaderboard";
import { Typography } from "@mui/material";
import { requireActiveUser } from "@/lib/redirectUtils";

async function ValhallaPage() {
  await requireActiveUser();
  const renownedPlayers = await getValhallaUsers();

  return (
    <MainContainer>
      <div className="flex flex-col justify-center items-center h-full">
        <h1 className="my-10 text-5xl text-red-400 text-center ">Valhalla</h1>
        <div className="flex flex-col mt-10 max-w-2/3 gap-3 justify-center xl:flex-row">
          <Leaderboard title={"Players of legend"} users={renownedPlayers} />
        </div>
        <div className="w-1/3">
          <Typography variant="body2" color="textSecondary" align="center">
            Current and past students who have chosen to forever remain in
            Valhalla are honored here. These players achieved level 50 and
            reached the pinnacle of greatness in TillerQuest. Their names will
            forever be remembered for generations to come.
          </Typography>
        </div>
      </div>
    </MainContainer>
  );
}

export default ValhallaPage;
