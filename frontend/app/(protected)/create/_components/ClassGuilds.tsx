import { getGuildsAndMemberCountBySchoolClass } from "@/data/guilds/getGuilds";
import { RadioGroup, FormControlLabel, Radio, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

interface Guild {
  id: number;
  name: string;
  memberCount: number;
}

function ClassGuilds({
  userId,
  schoolClass,
  setGuildId,
}: {
  userId: string;
  schoolClass: string;
  setGuildId: (guild: number) => void;
}) {
  const [guilds, setGuilds] = useState<Guild[]>([]);

  useEffect(() => {
    if (!schoolClass) {
      return;
    }
    const fetchGuildNames = async () => {
      const guilds = await getGuildsAndMemberCountBySchoolClass(
        userId,
        schoolClass,
      );
      setGuilds(guilds.map((guild) => guild));
    };

    fetchGuildNames();
  }, [setGuildId, userId, schoolClass]);

  const handleClick = (guildId: number) => {
    setGuildId(guildId);
  };

  if (!schoolClass) {
    return (
      <Typography variant="body1">
        Please select a school class to view available guilds.
      </Typography>
    );
  }

  if (guilds.length === 0) {
    return <Typography variant="body1">Loading guilds...</Typography>;
  }

  return (
    <div className="w-2/3 flex flex-col items-center">
      <RadioGroup row name="row-radio-buttons-group">
        {guilds.map((guildWithCount) => (
          <FormControlLabel
            value={guildWithCount.name}
            key={guildWithCount.name}
            control={<Radio />}
            disabled={guildWithCount.memberCount > 5}
            label={
              guildWithCount.name +
              " (" +
              guildWithCount.memberCount +
              " members)"
            }
            onClick={() => handleClick(guildWithCount.id)}
          />
        ))}
      </RadioGroup>
    </div>
  );
}

export default ClassGuilds;
