import MainContainer from "@/components/MainContainer";
import { Paper } from "@mui/material";
import ListControls from "./_components/ListControls";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";
import { UserResponse } from "./_components/types";

export default async function PowersPage() {
  await redirectIfNotAdmin();
  const users = await secureGet<UserResponse[]>("/admin/users");

  if (!users.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={users.error} />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Paper elevation={2} className="w-5/6 m-auto">
        <ListControls users={users.data} />
      </Paper>
    </MainContainer>
  );
}
