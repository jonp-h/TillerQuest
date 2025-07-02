import MainContainer from "@/components/MainContainer";
import { getBasicUserDetails } from "@/data/admin/adminUserInteractions";
import { getGuilds } from "@/data/guilds/getGuilds";
import { Typography } from "@mui/material";
import React from "react";
import GuildForm from "./_components/GuildForm";

async function Guilds() {
  const guilds = await getGuilds();
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

      {guilds?.map((guild) => (
        <div key={guild.name} className="flex justify-center py-2 gap-3">
          <Typography key={guild.name} variant="h5" align="center">
            {guild.schoolClass?.split("_")[1] || "No Class"}
          </Typography>
          <GuildForm
            guildName={guild.name}
            guildMembers={guild.members}
            users={users}
          />
        </div>
      ))}
    </MainContainer>
  );
}

export default Guilds;
