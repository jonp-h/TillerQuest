import MainContainer from "@/components/MainContainer";
import { Typography } from "@mui/material";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import GuideContent from "./_components/GuideContent";

async function GuidePage() {
  await redirectIfNotActiveUser();

  return (
    <MainContainer>
      <Typography
        variant="h2"
        component={"h1"}
        fontWeight={600}
        sx={{ marginTop: 6 }}
        align="center"
      >
        Guidebook
      </Typography>
      <GuideContent />
    </MainContainer>
  );
}

export default GuidePage;
