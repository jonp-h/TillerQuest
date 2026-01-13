import { secureGet } from "@/lib/secureFetch";
import CreateUserForm from "./_components/ResetUserForm";
import { redirectIfNotInactiveUser } from "@/lib/redirectUtils";
import ErrorAlert from "@/components/ErrorAlert";
import { InactiveUser } from "./_components/types";

export default async function ResetPage() {
  const session = await redirectIfNotInactiveUser();
  const user = await secureGet<InactiveUser>(
    `/users/${session.user.id}/inactive`,
  );
  if (!user.ok) {
    return ErrorAlert({
      message: "Failed to load user data for reset page.",
    });
  }

  return (
    <div>
      <CreateUserForm user={user.data} />
    </div>
  );
}
