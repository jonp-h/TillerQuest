import MainContainer from "@/components/MainContainer";
import { notFound } from "next/navigation";
import GameLeaderboard from "./_components/GameLeaderboard";
import GameTabs from "./_components/GameTabs";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import { Access, App } from "@tillerquest/prisma/browser";
import ErrorPage from "@/components/ErrorPage";
import { secureGet } from "@/lib/secureFetch";
import { GameUser } from "./_components/types";
import ErrorAlert from "@/components/ErrorAlert";
import { DateToString } from "@/types/dateToString";

async function Games() {
  const session = await redirectIfNotActiveUser();

  if (!session?.user) {
    return notFound();
  }

  const user = await secureGet<GameUser>(`/users/${session.user.id}/game`);
  const appsResult = await secureGet<DateToString<App[]>>(`/apps`);

  if (!user.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={user.error || "User not found."} />
      </MainContainer>
    );
  }

  if (!user.data.access.includes(Access.Arena)) {
    return (
      <ErrorPage
        text="You do not have access to the Arena games. Buy access in the abilities tab."
        redirectLink="/abilities"
      />
    );
  }

  let apps: DateToString<App[]> = [];
  if (!appsResult.ok) {
    apps = [];
  } else {
    apps = appsResult.data;
  }

  return (
    <MainContainer>
      <GameTabs user={user.data} apps={apps} />
      <div className="flex justify-center mt-5">
        <GameLeaderboard gameName="TypeQuest" />
      </div>
    </MainContainer>
  );
}

export default Games;
