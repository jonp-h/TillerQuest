import MainContainer from "@/components/MainContainer";
import { adminGetSystemMessageReadCounts } from "@/data/admin/systemMessages";
import { List, ListItem, Typography } from "@mui/material";
import SystemMessageForm from "./_components/SystemMessageForm";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import CreateSystemMessageForm from "./_components/CreateSystemMessageForm";
import { getTotalUserCount } from "@/data/user/getUser";

async function Manage() {
  await redirectIfNotAdmin();
  const userInfo = await adminGetSystemMessageReadCounts();
  const totalUserCount = await getTotalUserCount();

  const style = {
    p: 0,
    width: "90%",
    maxWidth: 1350,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  };

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Manage system messages
      </Typography>
      <div className="flex justify-center mt-2">
        <List sx={style}>
          {userInfo?.map(async (message) => (
            <ListItem key={message.id} sx={{ padding: 2 }}>
              <SystemMessageForm
                id={message.id}
                title={message.title}
                content={message.content}
                createdAt={new Date(message.createdAt)}
                readCount={message.readCount}
                totalUserCount={totalUserCount}
              />
            </ListItem>
          ))}
          <ListItem sx={{ padding: 2 }}>
            <CreateSystemMessageForm />
          </ListItem>
        </List>
      </div>
    </MainContainer>
  );
}

export default Manage;
