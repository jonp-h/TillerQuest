import MainContainer from "@/components/MainContainer";
import { notFound } from "next/navigation";
import React from "react";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import GuildSettingsForm from "./_components/GuildSettingsForm";
import { getGuildByUserId } from "@/data/guilds/getGuilds";

async function GuildSettingsPage() {
  const session = await redirectIfNotActiveUser();

  const guild = await getGuildByUserId(session.user.id);

  if (!guild) {
    notFound();
  }

  return (
    <MainContainer>
      <GuildSettingsForm userId={session.user.id} guild={guild} />
    </MainContainer>
  );
}

export default GuildSettingsPage;
