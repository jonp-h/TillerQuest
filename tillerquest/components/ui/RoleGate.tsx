import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import React from "react";
import ErrorBox from "./ErrorBox";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export default async function RoleGate({
  children,
  allowedRole,
}: RoleGateProps) {
  const role = await currentRole();

  if (role !== allowedRole) {
    return <ErrorBox message="You are not authorized to view this page." />;
  }

  return <>{children}</>;
}
