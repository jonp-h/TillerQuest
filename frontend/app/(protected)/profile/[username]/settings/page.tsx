import MainContainer from "@/components/MainContainer";
import { getUserProfileByUsername } from "@/data/user/getUser";
import { notFound } from "next/navigation";
import React from "react";
import ProfileSettingsForm from "./_components/ProfileSettingsForm";
import { requireAccessAndUsername } from "@/lib/redirectUtils";

async function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  await requireAccessAndUsername(username);

  const user = await getUserProfileByUsername(username);

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
