import MainContainer from "@/components/MainContainer";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";
import { FullUser } from "@/types/users";
import PlayerList from "./_components/PlayerList";
import { Typography } from "@mui/material";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ schoolclass: string }>;
}) {
  const { schoolclass } = await params;

  await redirectIfNotAdmin();
  const users = await secureGet<FullUser[]>(
    "/admin/users?fields=full&schoolClass=" + schoolclass,
  );

  if (!users.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={users.error || "Failed to fetch users"} />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Typography variant="h2" className="text-center mb-5">
        {schoolclass.split("_")[1]}
      </Typography>
      <PlayerList users={users.data} />
    </MainContainer>
  );
}
