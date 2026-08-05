import MainContainer from "@/components/MainContainer";
import { Button, Paper } from "@mui/material";
import ListControls from "./_components/ListControls";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";
import { UserResponse } from "./_components/types";
import { SchoolClass } from "@tillerquest/prisma/browser";

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
        <div className="flex flex-wrap gap-3 justify-center p-3">
          {Object.keys(SchoolClass).map((schoolClass) => (
            <Button
              key={schoolClass}
              variant="contained"
              color="success"
              href={`/gamemaster/powers/${schoolClass}`}
            >
              {schoolClass.split("_")[1]}
            </Button>
          ))}
        </div>
        <ListControls users={users.data} />
      </Paper>
    </MainContainer>
  );
}
