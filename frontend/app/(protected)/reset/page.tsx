import { secureGet } from "@/lib/secureFetch";
import CreateUserForm from "./_components/ResetUserForm";
import { redirectIfNotInactiveUser } from "@/lib/redirectUtils";
import ErrorAlert from "@/components/ErrorAlert";
import { InactiveUser } from "./_components/types";
import NotificationBox from "@/components/Notification";
import type { Notification } from "@tillerquest/prisma/browser";
import MainContainer from "@/components/MainContainer";

export default async function ResetPage() {
  const session = await redirectIfNotInactiveUser();
  const user = await secureGet<InactiveUser>(
    `/users/${session.user.id}/inactive`,
  );
  if (!user.ok) {
    return ErrorAlert({
      message: user.error || "Failed to load user data.",
    });
  }

  const notifications = await secureGet<Notification[]>(
    `/notifications/${session.user.id}`,
  );

  return (
    <MainContainer>
      {/* Render system messages if they exist and the user has not read them yet */}
      {notifications.ok &&
        notifications.data.map((message) => (
          <NotificationBox
            key={message.id}
            message={message}
            userId={session.user.id}
          />
        ))}
      <CreateUserForm user={user.data} />
    </MainContainer>
  );
}
