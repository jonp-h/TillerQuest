import MainContainer from "@/components/MainContainer";
import { Typography } from "@mui/material";
import RerollCosmic from "./_components/RerollCosmic";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { secureGet } from "@/lib/secureFetch";
import { CosmicEvent } from "@tillerquest/prisma/browser";
import ErrorAlert from "@/components/ErrorAlert";

export default async function CosmicPage() {
  await redirectIfNotAdmin();
  // TODO: cache all cosmic events data fetching
  const cosmicEvents = await secureGet<CosmicEvent[]>("/admin/cosmics");
  if (!cosmicEvents.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={cosmicEvents.error} />
      </MainContainer>
    );
  }
  const recommendedCosmic = await secureGet<CosmicEvent | null>(
    "/admin/cosmics/recommended",
  );
  const selectedCosmicEvents = await secureGet<{
    vg1: CosmicEvent | null;
    vg2: CosmicEvent | null;
  }>("/admin/cosmics/selected");

  return (
    <MainContainer>
      <Typography variant="h1" align="center">
        Cosmic Events
      </Typography>
      <RerollCosmic
        cosmicEvents={cosmicEvents.data}
        recommendedCosmic={recommendedCosmic.ok ? recommendedCosmic.data : null}
        selectedCosmicEvents={
          selectedCosmicEvents.ok
            ? selectedCosmicEvents.data
            : { vg1: null, vg2: null }
        }
      />
    </MainContainer>
  );
}
