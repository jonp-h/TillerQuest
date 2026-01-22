import MainContainer from "@/components/MainContainer";
import { List, ListItem, Typography } from "@mui/material";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";
import { Quest } from "@tillerquest/prisma/browser";
import QuestForm from "./_components/QuestForm";
import CreateQuest from "./_components/CreateQuest";

async function Quests() {
  await redirectIfNotAdmin();
  const quests = await secureGet<Quest[]>("/quests");

  if (!quests.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={quests.error || "Failed to load quests."} />
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
        Manage system messages
      </Typography>
      <div className="flex justify-center mt-2">
        <List sx={style}>
          {quests.data.map(async (quest) => (
            <ListItem key={quest.id} sx={{ padding: 2 }}>
              <QuestForm quest={quest} />
            </ListItem>
          ))}
          <ListItem sx={{ padding: 2 }}>
            <CreateQuest />
          </ListItem>
        </List>
      </div>
    </MainContainer>
  );
}

export default Quests;
