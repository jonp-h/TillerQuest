import MainContainer from "@/components/MainContainer";
import { notFound } from "next/navigation";
import ProfileSettingsForm from "./_components/ProfileSettingsForm";
import { redirectIfWrongUsernameOrNotActiveUser } from "@/lib/redirectUtils";
import { secureFetch } from "@/lib/secureFetch";
import { UserSettings } from "./_components/types";

async function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  await redirectIfWrongUsernameOrNotActiveUser(username);

  const user = await secureFetch<UserSettings>(`/users/${username}/settings`);

  if (!user.ok) {
    notFound();
  }

  return (
    <MainContainer>
      <ProfileSettingsForm user={user.data} />
    </MainContainer>
  );
}

export default ProfileSettingsPage;
