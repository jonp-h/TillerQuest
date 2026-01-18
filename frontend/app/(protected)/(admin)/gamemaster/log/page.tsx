import MainContainer from "@/components/MainContainer";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { Paper, Typography } from "@mui/material";
import LogList from "./_components/LogList";

async function LogPage() {
  await redirectIfNotAdmin();

  return (
    <MainContainer>
      <Paper
        elevation={5}
        className="m-3 pb-3 text-center flex flex-col items-center"
      >
        <Typography variant="h4" className="p-2">
          User logs
        </Typography>
        <LogList />
      </Paper>
    </MainContainer>
  );
}

export default LogPage;
