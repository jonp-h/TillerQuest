import MainContainer from "@/components/MainContainer";
import { List, ListItem, Typography } from "@mui/material";
import ManageUserForm from "./_components/ManageUserForm";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";
import { AdminUserResponse } from "./_components/types";

async function Users() {
  await redirectIfNotAdmin();
  const userInfo = await secureGet<AdminUserResponse[]>(
    "/admin/users?fields=admin",
  );

  if (!userInfo.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={userInfo.error || "Failed to load user data."} />
      </MainContainer>
    );
  }

  const specialStatues = await secureGet<{ specialReq: string | null }[]>(
    "/admin/special-statuses",
  ).then((res) => (res.ok ? res.data : []));

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
          {userInfo.data.map((user) => (
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
