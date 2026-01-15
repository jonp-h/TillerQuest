import MainContainer from "@/components/MainContainer";
import { notFound } from "next/navigation";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import GuildSettingsForm from "./_components/GuildSettingsForm";
import GuildLeaderboard from "./_components/GuildLeaderboard";
import { secureGet } from "@/lib/secureFetch";
import { GuildLeaderboardType, GuildSettings } from "./_components/types";
import ErrorAlert from "@/components/ErrorAlert";

async function GuildSettingsPage() {
  const session = await redirectIfNotActiveUser();

  const guild = await secureGet<GuildSettings>(
    `/users/${session.user.id}/guild`,
  );
  const topGuilds =
    await secureGet<GuildLeaderboardType>(`/guilds/leaderboard`);

  if (!guild.ok) {
    return ErrorAlert({ message: guild.error || "Failed to load guild data." });
  }

  if (!topGuilds.ok) {
    return ErrorAlert({
      message: topGuilds.error || "Failed to load guild leaderboard.",
    });
  }

  return (
    <MainContainer>
      <GuildSettingsForm userId={session.user.id} guild={guild.data} />
      <GuildLeaderboard guilds={topGuilds.data} />
    </MainContainer>
  );
}

export default GuildSettingsPage;
