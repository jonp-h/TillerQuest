import MainContainer from "@/components/MainContainer";
import Battleground from "./_components/Battleground";

import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import { Typography } from "@mui/material";
import { secureGet } from "@/lib/secureFetch";
import { Ability, GuildEnemy } from "@tillerquest/prisma/browser";

async function DungeonPage() {
  const session = await redirectIfNotActiveUser();

  const dungeonAbilities = await secureGet<Ability[]>(
    `/users/${session.user.id}/abilities/dungeon`,
  );

  const enemies = await secureGet<GuildEnemy[]>(
    `/users/${session.user.id}/guild/enemies`,
  );
  const userTurns = await secureGet<number>(`/users/${session.user.id}/turns`);

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
          abilities={dungeonAbilities.ok ? dungeonAbilities.data : []}
          userId={session.user.id}
          enemies={enemies.ok ? enemies.data : []}
          userTurns={userTurns.ok ? userTurns.data : 0}
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
