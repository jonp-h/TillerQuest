import { getGuildNames } from "@/data/guilds/getGuilds";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";
import React, { useEffect, useState } from "react";

function ClassGuilds({
  guild,
  setGuild,
}: {
  guild: string;
  setGuild: (guild: string) => void;
}) {
  const [guilds, setGuilds] = useState<string[]>([]);

  useEffect(() => {
    const fetchGuildNames = async () => {
      const guilds = await getGuildNames();
      setGuilds(guilds.map((guild) => guild.name));
      if (guilds.length > 0) {
        setGuild(guilds[0].name);
      }
    };

    fetchGuildNames();
  }, [setGuild]);

  const handleClick = (guildName: string) => {
    setGuild(guildName);
  };

  return (
    <div>
      <RadioGroup row name="row-radio-buttons-group">
        {guilds.map((guildName) => (
          <FormControlLabel
            value={guildName}
            key={guildName}
            control={<Radio />}
            checked={guildName === guild}
            label={guildName}
            onClick={() => handleClick(guildName)}
          />
        ))}
      </RadioGroup>
    </div>
  );
}

export default ClassGuilds;
