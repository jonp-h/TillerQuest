import MainContainer from "@/components/MainContainer";
import Battleground from "./_components/Battleground";
import { getDungeonAbilities } from "@/data/dungeons/dungeonAbilities";
import { getEnemies, getUserTurns } from "@/data/dungeons/dungeon";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import { Typography } from "@mui/material";

async function DungeonPage() {
  const session = await redirectIfNotActiveUser();

  if (!session?.user.id) {
    throw new Error("User error");
  }

  const dungeonAbilities = await getDungeonAbilities(session.user.id);
  const enemies = await getEnemies(session.user.id);
  const userTurns = await getUserTurns(session.user.id);

  return (
    <MainContainer>
      <Typography
        variant="h3"
        component={"h1"}
        sx={{ marginY: 3 }}
        className="text-5xl text-center mt-10"
      >
        The Dungeons
      </Typography>{" "}
      {enemies ? (
        <Battleground
          abilities={dungeonAbilities ?? []}
          userId={session.user.id}
          enemies={enemies}
          userTurns={userTurns}
        />
      ) : (
        <Typography
          variant="h4"
          component={"h2"}
          color="error"
          sx={{ marginBottom: 5 }}
        >
          You search the dungeons, but find nothing...
        </Typography>
      )}
    </MainContainer>
  );
}

export default DungeonPage;
