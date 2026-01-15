import { secureGet } from "@/lib/secureFetch";
import CreateUserForm from "./_components/CreateUserForm";
import { redirectIfNotNewUser } from "@/lib/redirectUtils";
import ErrorAlert from "@/components/ErrorAlert";
import { NewUser } from "./_components/types";

export default async function CreatePage() {
  const session = await redirectIfNotNewUser();
  const user = await secureGet<NewUser>(`/users/${session.user.id}/new`);

  if (!user.ok) {
    return ErrorAlert({
      message: user.error || "Failed to load user data.",
    });
  }

  return (
    <div>
      <CreateUserForm user={user.data} />
    </div>
  );
}
