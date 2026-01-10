import MainContainer from "@/components/MainContainer";
import { notFound } from "next/navigation";
import GameLeaderboard from "./_components/GameLeaderboard";
import GameTabs from "./_components/GameTabs";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import { Access } from "@tillerquest/prisma/browser";
import ErrorPage from "@/components/ErrorPage";
import { secureGet } from "@/lib/secureFetch";
import { GameUser } from "./_components/types";

async function Games() {
  const session = await redirectIfNotActiveUser();

  if (!session?.user) {
    return notFound();
  }

  const user = await secureGet<GameUser>(`/users/${session.user.id}/game`);

  if (!user.ok) {
    return notFound();
  }

  if (!user.data.access.includes(Access.Arena)) {
    return (
      <ErrorPage
        text="You do not have access to the Arena games. Buy access in the abilities tab."
        redirectLink="/abilities"
      />
    );
  }

  return (
    <MainContainer>
      <GameTabs user={user.data} />
      <div className="flex justify-center mt-5">
        <GameLeaderboard gameName="TypeQuest" />
      </div>
    </MainContainer>
  );
}

export default Games;
