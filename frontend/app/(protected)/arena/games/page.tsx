import MainContainer from "@/components/MainContainer";
import { notFound } from "next/navigation";
import { getGameUserById } from "@/data/user/getUser";
import GameLeaderboard from "./_components/GameLeaderboard";
import GameTabs from "./_components/GameTabs";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import { $Enums } from "@prisma/client";
import ErrorPage from "@/components/ErrorPage";

async function Games() {
  const session = await redirectIfNotActiveUser();

  if (!session?.user) {
    return notFound();
  }

  const user = await getGameUserById(session.user.id);

  if (!user) {
    return notFound();
  }

  if (!user.access.includes($Enums.Access.Arena)) {
    return (
      <ErrorPage
        text="You do not have access to the Arena games. Buy access in the abilities tab."
        redirectLink="/abilities"
      />
    );
  }

  return (
    <MainContainer>
      <GameTabs user={user} />
      <div className="flex justify-center mt-5">
        <GameLeaderboard gameName="TypeQuest" />
      </div>
    </MainContainer>
  );
}

export default Games;
