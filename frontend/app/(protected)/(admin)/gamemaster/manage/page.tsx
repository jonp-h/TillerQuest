import MainContainer from "@/components/MainContainer";
import {
  adminGetUserInfo,
  getSpecialStatuses,
} from "@/data/admin/adminUserInteractions";
import { List, ListItem, Typography } from "@mui/material";
import React from "react";
import ManageUserForm from "./_components/ManageUserForm";
import { requireAdmin } from "@/lib/redirectUtils";
import { $Enums } from "@prisma/client";

async function Manage() {
  await requireAdmin();
  const userInfo = await adminGetUserInfo();
  const specialStatues = await getSpecialStatuses();

  const style = {
    p: 0,
    width: "90%",
    maxWidth: 1650,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  };

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Manage Users
      </Typography>
      <Typography variant="h6" align="center">
        Write special statuses separated by space
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        gutterBottom
      >
        OPTIONS: {specialStatues?.map((status) => status.specialReq).join(", ")}
      </Typography>
      <Typography variant="h6" align="center">
        Write player access separated by space
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary">
        {Object.values($Enums.Access).join(", ")}
      </Typography>
      <div className="flex justify-center mt-2">
        <List sx={style}>
          {userInfo?.map((user) => (
            <ListItem key={user.username} sx={{ padding: 2 }}>
              <ManageUserForm
                name={user.name}
                id={user.id}
                role={user.role}
                special={user.special}
                access={user.access}
                schoolClass={user.schoolClass}
                username={user.username}
                lastname={user.lastname}
              />
            </ListItem>
          ))}
        </List>
      </div>
    </MainContainer>
  );
}

export default Manage;
