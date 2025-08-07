import React from "react";
import CreateUserForm from "./_components/CreateUserForm";
import { redirectIfNotNewUser } from "@/lib/redirectUtils";
import { getCreateUserById } from "@/data/user/getUser";

export default async function CreatePage() {
  const session = await redirectIfNotNewUser();
  const data = await getCreateUserById(session.user.id);

  return (
    <div>
      <CreateUserForm data={data} />
    </div>
  );
}
