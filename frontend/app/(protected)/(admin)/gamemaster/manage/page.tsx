import MainContainer from "@/components/MainContainer";
import {
  getSpecialStatuses,
  getUsersSpecialStatus,
} from "@/data/admin/adminUserInteractions";
import { Typography } from "@mui/material";
import React from "react";
import UserSpecialStatus from "./_components/UserSpecialStatus";

async function Manage() {
  const userSpecialStatus = await getUsersSpecialStatus();
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
      {userSpecialStatus?.map((user) => (
        <div key={user.username} className="flex justify-center mt-2">
          <UserSpecialStatus
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
