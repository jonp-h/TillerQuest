import MainContainer from "@/components/MainContainer";
import { Paper } from "@mui/material";

import { getAllActiveUsers } from "@/data/admin/adminUserInteractions";
import ListControls from "./_components/ListControls";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";

export default async function PowersPage() {
  await redirectIfNotAdmin();
  const users = await getAllActiveUsers();

  return (
    <MainContainer>
      <Paper elevation={2} className="w-5/6 m-auto">
        <ListControls users={users} />
      </Paper>
    </MainContainer>
  );
}
