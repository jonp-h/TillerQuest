import MainContainer from "@/components/MainContainer";
import { Typography } from "@mui/material";
import GuildForm from "./_components/GuildForm";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";
import { BasicUser, GuildResponse } from "./_components/types";

async function Guilds() {
  await redirectIfNotAdmin();
  const guilds = await secureGet<GuildResponse>("/admin/guilds");

  if (!guilds.ok) {
    console.log(guilds);
    return (
      <MainContainer>
        <ErrorAlert message={`Error fetching guilds: ${guilds.error}`} />
      </MainContainer>
    );
  }

  const users = await secureGet<BasicUser[]>("/admin/users?fields=basic");
  if (!users.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={`Error fetching users: ${users.error}`} />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Manage Guilds
      </Typography>
      <Typography variant="h6" align="center" color="lightgreen">
        No guilds can have the same name. Recommended number of guildmembers are
        6.
      </Typography>
      <Typography variant="h5" align="center" color="primary">
        Active Guilds
      </Typography>
      {guilds.data.activeGuilds?.map((guild) => (
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
            users={users.data}
          />
        </div>
      ))}
      <Typography variant="h5" align="center" color="primary">
        Archived Guilds
      </Typography>
      {guilds.data.archivedGuilds?.map((guild) => (
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
            users={users.data}
          />
        </div>
      ))}
    </MainContainer>
  );
}

export default Guilds;
