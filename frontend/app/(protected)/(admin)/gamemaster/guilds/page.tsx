import MainContainer from "@/components/MainContainer";
import { getBasicUserDetails } from "@/data/admin/adminUserInteractions";
import { getGuilds } from "@/data/guilds/getGuilds";
import { Typography } from "@mui/material";
import React from "react";
import GuildForm from "./_components/GuildForm";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";

async function Guilds() {
  await redirectIfNotAdmin();
  const activeGuilds = await getGuilds(false);
  const archivedGuilds = await getGuilds(true);
  const users = await getBasicUserDetails();

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Manage Guilds
      </Typography>
      <Typography variant="h6" align="center" color="lightgreen">
        No guilds can have the same name. Recommended number of guildmembers are
        5.
      </Typography>
      <Typography variant="h5" align="center" color="primary">
        Active Guilds
      </Typography>
      {activeGuilds?.map((guild) => (
        <div key={guild.name} className="flex justify-center py-2 gap-3">
          <Typography key={guild.name} variant="h5" align="center">
            {guild.schoolClass?.split("_")[1] || "No Class"}
          </Typography>
          <GuildForm
            guildName={guild.name}
            guildLeader={guild.guildLeader}
            nextGuildLeader={guild.nextGuildLeader}
            guildMembers={guild.members}
            archived={guild.archived}
            users={users}
          />
        </div>
      ))}
      <Typography variant="h5" align="center" color="primary">
        Archived Guilds
      </Typography>
      {archivedGuilds?.map((guild) => (
        <div key={guild.name} className="flex justify-center py-2 gap-3">
          <Typography key={guild.name} variant="h5" align="center">
            {guild.schoolClass?.split("_")[1] || "No Class"}
          </Typography>
          <GuildForm
            guildName={guild.name}
            guildLeader={guild.guildLeader}
            nextGuildLeader={guild.nextGuildLeader}
            guildMembers={guild.members}
            archived={guild.archived}
            users={users}
          />
        </div>
      ))}
    </MainContainer>
  );
}

export default Guilds;
