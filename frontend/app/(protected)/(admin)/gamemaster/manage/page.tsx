import MainContainer from "@/components/MainContainer";
import {
  adminGetUserInfo,
  getSpecialStatuses,
} from "@/data/admin/adminUserInteractions";
import { Typography } from "@mui/material";
import React from "react";
import ManageUserForm from "./_components/ManageUserForm";

async function Manage() {
  const userInfo = await adminGetUserInfo();
  const specialStatues = await getSpecialStatuses();

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Manage Users
      </Typography>
      <Typography variant="h6" align="center">
        Write special statuses separated by space
      </Typography>
      <Typography variant="body1" align="center">
        OPTIONS: {specialStatues?.map((status) => status.specialReq).join(", ")}
      </Typography>
      {userInfo?.map((user) => (
        <div key={user.username} className="flex justify-center mt-2">
          <ManageUserForm
            name={user.name}
            id={user.id}
            role={user.role}
            special={user.special}
            username={user.username}
            lastname={user.lastname}
          />
        </div>
      ))}
    </MainContainer>
  );
}

export default Manage;
