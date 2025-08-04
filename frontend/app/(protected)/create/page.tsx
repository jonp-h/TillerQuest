import React from "react";
import CreateUserForm from "./_components/CreateUserForm";
import { requireNewUser } from "@/lib/redirectUtils";
import { getCreateUserById } from "@/data/user/getUser";

export default async function CreatePage() {
  const session = await requireNewUser();
  const data = await getCreateUserById(session.user.id);

  return (
    <div>
      <CreateUserForm data={data} />
    </div>
  );
}
