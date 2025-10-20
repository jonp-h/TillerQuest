import MainContainer from "@/components/MainContainer";
import { getValhallaUsers } from "@/data/user/getUser";
import Leaderboard from "../_components/Leaderboard";
import { Typography } from "@mui/material";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";

async function ValhallaPage() {
  await redirectIfNotActiveUser();
  const renownedPlayers = await getValhallaUsers();

  return (
    <MainContainer>
      <div className="flex flex-col justify-center items-center h-full">
        <Typography
          variant="h2"
          color="secondary"
          fontWeight={"500"}
          component={"h1"}
          sx={{ marginY: 7 }}
        >
          Valhalla
        </Typography>
        <div className="flex flex-col mt-10 max-w-2/3 gap-3 justify-center xl:flex-row">
          <Leaderboard title={"Players of Legend"} users={renownedPlayers} />
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
