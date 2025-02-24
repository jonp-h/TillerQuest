import MainContainer from "@/components/MainContainer";
import { getUsersSpecialStatus } from "@/data/admin/adminUserInteractions";
import { Typography } from "@mui/material";
import React from "react";
import UserSpecialStatus from "./_components/UserSpecialStatus";

async function Manage() {
  const userSpecialStatus = await getUsersSpecialStatus();

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Manage Users
      </Typography>
      <Typography variant="h6" align="center">
        Write special statuses separated by space
      </Typography>
      <Typography variant="body1" align="center">
        OPTIONS: student-council, ctf, ctf-winner, trusted
      </Typography>
      {userSpecialStatus?.map((user) => (
        <div key={user.username} className="flex justify-center">
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
