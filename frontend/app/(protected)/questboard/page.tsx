import ErrorAlert from "@/components/ErrorAlert";
import MainContainer from "@/components/MainContainer";
import { secureGet } from "@/lib/secureFetch";
import { Typography } from "@mui/material";
import { Quest } from "@tillerquest/prisma/browser";
import QuestCard from "./_components/QuestCard";

async function QuestBoardPage() {
  const quests = await secureGet<Quest[]>("/api/quests");

  if (!quests.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={quests.error} />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Typography variant="h1">Quest Board</Typography>
      <div className="grid grid-cols-4 gap-4 mt-5">
        {quests.data.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </MainContainer>
  );
}

export default QuestBoardPage;
