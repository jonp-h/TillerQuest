import { getGuildNames } from "@/data/guilds";
import { FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import React from "react";

async function ClassGuilds({
  guild,
  setGuild,
}: {
  guild: string;
  setGuild: React.Dispatch<React.SetStateAction<string>>;
}) {
  const guilds = await getGuildNames();

  return (
    <div>
      <FormLabel>School class</FormLabel>
      <RadioGroup row name="row-radio-buttons-group">
        {guilds.map((guildName) => (
          <FormControlLabel
            value={guildName.name}
            key={guildName.name}
            control={<Radio />}
            checked={guildName.name === guild}
            label={guildName.name}
            onClick={() => setGuild(guildName.name)}
          />
        ))}
      </RadioGroup>
    </div>
  );
}

export default ClassGuilds;
