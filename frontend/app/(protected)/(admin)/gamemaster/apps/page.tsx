import MainContainer from "@/components/MainContainer";
import { List, ListItem, Typography } from "@mui/material";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import AppForm from "./_components/AppForm";
import { secureGet } from "@/lib/secureFetch";
import ErrorAlert from "@/components/ErrorAlert";
import { App } from "@tillerquest/prisma/browser";
import { DateToString } from "@/types/dateToString";

async function AppsAdminPage() {
  await redirectIfNotAdmin();
  const apps = await secureGet<DateToString<App[]>>("/apps");

  if (!apps.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={apps.error || "Failed to load apps."} />
      </MainContainer>
    );
  }

  const style = {
    p: 0,
    width: "60%",
    maxWidth: 1600,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  };

  return (
    <MainContainer>
      <Typography variant="h4" align="center">
        Apps
      </Typography>
      <div className="flex justify-center mt-2">
        <List sx={style}>
          {apps.data.map((app) => (
            <ListItem key={app.name} sx={{ padding: 2 }}>
              <AppForm app={app} />
            </ListItem>
          ))}
        </List>
      </div>
    </MainContainer>
  );
}

export default AppsAdminPage;
