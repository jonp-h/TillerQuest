import MainContainer from "@/components/MainContainer";
import { List, ListItem, Typography } from "@mui/material";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import GameSettingsForm from "./_components/GameSettingsForm";
import { secureGet } from "@/lib/secureFetch";
import { TillerQuestSettings } from "@tillerquest/prisma/browser";
import ErrorAlert from "@/components/ErrorAlert";

async function GameSettings() {
  await redirectIfNotAdmin();
  const tillerQuestSettings =
    await secureGet<TillerQuestSettings[]>(`/admin/settings`);

  if (!tillerQuestSettings.ok) {
    return (
      <MainContainer>
        <ErrorAlert
          message={`Failed to load TillerQuest settings: ${tillerQuestSettings.error}`}
        />
      </MainContainer>
    );
  }

  const style = {
    p: 0,
    width: "80%",
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
          {tillerQuestSettings.data.map((setting) => (
            <ListItem key={setting.key} sx={{ padding: 2 }}>
              <GameSettingsForm setting={setting} />
            </ListItem>
          ))}
        </List>
      </div>
    </MainContainer>
  );
}

export default GameSettings;
