import MainContainer from "@/components/MainContainer";
import { notFound } from "next/navigation";
import React from "react";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import GuildSettingsForm from "./_components/GuildSettingsForm";
import { getGuildByUserId, getGuildLeaderboard } from "@/data/guilds/getGuilds";
import GuildLeaderboard from "./_components/GuildLeaderboard";

async function GuildSettingsPage() {
  const session = await redirectIfNotActiveUser();

  const guild = await getGuildByUserId(session.user.id);
  const topGuilds = await getGuildLeaderboard();

  if (!guild) {
    notFound();
  }

  return (
    <MainContainer>
      <GuildSettingsForm userId={session.user.id} guild={guild} />
      <GuildLeaderboard guilds={topGuilds} />
    </MainContainer>
  );
}

export default GuildSettingsPage;
