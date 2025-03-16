import { auth } from "@/auth";
import MainContainer from "@/components/MainContainer";
import { getUserProfileByUsername } from "@/data/user/getUser";
import { notFound } from "next/navigation";
import React from "react";
import ProfileSettingsForm from "./_components/ProfileSettingsForm";

async function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const session = await auth();

  if (session?.user.username !== username) {
    notFound();
  }

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
