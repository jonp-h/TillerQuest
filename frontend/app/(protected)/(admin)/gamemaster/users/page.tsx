import MainContainer from "@/components/MainContainer";
import { Box, Paper } from "@mui/material";
import React from "react";

import { getAllUsers } from "@/data/admin/adminUserInteractions";
import ListControls from "./_components/ListControls";

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <MainContainer>
      <Paper elevation={2} className="w-5/6 m-auto">
        <ListControls users={users} />
      </Paper>
    </MainContainer>
  );
}
