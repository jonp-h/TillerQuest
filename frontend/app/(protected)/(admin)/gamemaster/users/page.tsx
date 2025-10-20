import MainContainer from "@/components/MainContainer";
import {
  adminGetUserInfo,
  getSpecialStatuses,
} from "@/data/admin/adminUserInteractions";
import { List, ListItem, Typography } from "@mui/material";
import ManageUserForm from "./_components/ManageUserForm";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";

async function Users() {
  await redirectIfNotAdmin();
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
                specialStatuses={specialStatues}
              />
            </ListItem>
          ))}
        </List>
      </div>
    </MainContainer>
  );
}

export default Users;
