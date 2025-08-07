import MainContainer from "@/components/MainContainer";
import { List, ListItem, Typography } from "@mui/material";
import React from "react";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { adminGetApplicationSettings } from "@/data/admin/gameSettings";
import GameSettingsForm from "./_components/GameSettingsForm";

async function GameSettings() {
  const session = await redirectIfNotAdmin();
  const applicationSettings = await adminGetApplicationSettings(
    session.user.id,
  );

  const style = {
    p: 0,
    width: "40%",
    maxWidth: 1600,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  };

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        GameSettings
      </Typography>
      <div className="flex justify-center mt-2">
        <List sx={style}>
          {applicationSettings?.map((setting) => (
            <ListItem key={setting.key} sx={{ padding: 2 }}>
              <GameSettingsForm userId={session.user.id} setting={setting} />
            </ListItem>
          ))}
        </List>
      </div>
    </MainContainer>
  );
}

export default GameSettings;
