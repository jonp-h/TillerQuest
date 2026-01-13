import { RadioGroup, FormControlLabel, Radio, Typography } from "@mui/material";
import { GuildWithMemberClasses } from "./types";
import Classes from "./Classes";
import { Class } from "@tillerquest/prisma/browser";

function ClassGuilds({
  guildId,
  schoolClass,
  setGuildId,
  guilds,
  maxMembers,
  setPlayerClass,
  image,
  setImage,
}: {
  guildId: number;
  schoolClass: string;
  setGuildId: (guild: number) => void;
  guilds: GuildWithMemberClasses[];
  maxMembers: number;
  setPlayerClass: (playerClass: Class) => void;
  image: string;
  setImage: (image: string) => void;
}) {
  const selectedGuild = guilds.find((g) => g.id === guildId);

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
    <div className="w-2/3 gap-5 flex flex-col items-center">
      <RadioGroup row name="row-radio-buttons-group">
        {guilds.map((guildWithCount) => (
          <FormControlLabel
            value={guildWithCount.name}
            key={guildWithCount.name}
            control={<Radio />}
            disabled={guildWithCount.members.length > maxMembers}
            label={
              guildWithCount.name +
              " (" +
              guildWithCount.members.length +
              " members)"
            }
            onClick={() => handleClick(guildWithCount.id)}
          />
        ))}
      </RadioGroup>
      {selectedGuild && (
        <>
          <Typography variant="h5">Choose player class</Typography>
          <Classes
            setPlayerClass={setPlayerClass}
            image={image}
            setImage={setImage}
            guild={selectedGuild}
          />
        </>
      )}
    </div>
  );
}

export default ClassGuilds;
