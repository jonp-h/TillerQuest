import ErrorAlert from "@/components/ErrorAlert";
import MainContainer from "@/components/MainContainer";
import { secureGet } from "@/lib/secureFetch";
import { Typography } from "@mui/material";
import { Quest } from "@tillerquest/prisma/browser";
import QuestCard from "./_components/QuestCard";

async function QuestBoardPage() {
  const quests = await secureGet<Quest[]>("/quests");

  if (!quests.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={quests.error} />
      </MainContainer>
    );
  }

  if (quests.data.length === 0) {
    return (
      <MainContainer>
        <Typography variant="h1">Quest Board</Typography>
        <Typography variant="body1" className="mt-4">
          No quests available at the moment. Please check back later!
        </Typography>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Typography variant="h1" className="text-center">
        Quest Board
      </Typography>
      <div className="mx-auto rounded-xl p-3 mb-6 w-fit">
        <Typography variant="h6" align="center" color="secondary" gutterBottom>
          The Game Masters sometimes have special quest requests for brave
          adventurers
        </Typography>

        <Typography variant="body1" align="center">
          Browse the available quests below, and take on the ones that call to
          you. Rewards await!
          <br />
          First come, first served!
        </Typography>
      </div>

      {/* Bulletin Board Container */}
      <div className="bg-gradient-to-br from-amber-900 to-amber-950 p-8 mx-20 rounded-lg border-8 border-amber-800 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4">
          {quests.data.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </MainContainer>
  );
}

export default QuestBoardPage;
