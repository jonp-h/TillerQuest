import MainContainer from "@/components/MainContainer";
import {
  getAllCosmicEvents,
  getRecommendedCosmicEvent,
  getSelectedCosmicEvents,
} from "@/data/admin/cosmic";
import { Typography } from "@mui/material";
import RerollCosmic from "./_components/RerollCosmic";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";

export default async function CosmicPage() {
  await redirectIfNotAdmin();
  // TODO: cache all cosmic events data fetching
  const cosmicEvents = await getAllCosmicEvents();
  const recommendedCosmic = await getRecommendedCosmicEvent();
  const selectedCosmicEvents = await getSelectedCosmicEvents();

  return (
    <MainContainer>
      <Typography variant="h1" align="center">
        Cosmic Events
      </Typography>
      <RerollCosmic
        cosmicEvents={cosmicEvents}
        recommendedCosmic={recommendedCosmic}
        selectedCosmicEvents={selectedCosmicEvents}
      />
    </MainContainer>
  );
}
