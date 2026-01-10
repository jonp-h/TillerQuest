import MainContainer from "@/components/MainContainer";
import { List, ListItem, Typography } from "@mui/material";
import SystemMessageForm from "./_components/SystemMessageForm";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import CreateSystemMessageForm from "./_components/CreateSystemMessageForm";
import { secureGet } from "@/lib/secureFetch";
import { Prisma } from "@tillerquest/prisma/browser";
import ErrorAlert from "@/components/ErrorAlert";

type Notification = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  readCount: number;
};

async function Manage() {
  await redirectIfNotAdmin();
  const notifications = await secureGet<Notification[]>(`/admin/notifications`);

  if (!notifications.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={notifications.error} />
      </MainContainer>
    );
  }

  const totalUserCount = await secureGet<number>(`/admin/users/count/total`);

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
          {notifications.data.map(async (message) => (
            <ListItem key={message.id} sx={{ padding: 2 }}>
              <SystemMessageForm
                id={message.id}
                title={message.title}
                content={message.content}
                createdAt={new Date(message.createdAt)}
                readCount={message.readCount}
                totalUserCount={totalUserCount.ok ? totalUserCount.data : 0}
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
