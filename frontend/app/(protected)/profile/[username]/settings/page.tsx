import MainContainer from "@/components/MainContainer";
import { getUserSettingsByUsername } from "@/data/user/getUser";
import { notFound } from "next/navigation";
import React from "react";
import ProfileSettingsForm from "./_components/ProfileSettingsForm";
import { redirectIfWrongUsernameOrNotActiveUser } from "@/lib/redirectUtils";

async function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  await redirectIfWrongUsernameOrNotActiveUser(username);

  const user = await getUserSettingsByUsername(username);

  if (!user) {
    notFound();
  }

  return (
    <MainContainer>
      <ProfileSettingsForm user={user} />
    </MainContainer>
  );
}

export default ProfileSettingsPage;
