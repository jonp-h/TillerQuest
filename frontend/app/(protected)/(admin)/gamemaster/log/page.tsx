import MainContainer from "@/components/MainContainer";
import { getAllLogs } from "@/data/log/getLog";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Fragment } from "react";

async function LogPage() {
  await redirectIfNotAdmin();
  const userLogs = await getAllLogs();

  const style = {
    p: 0,
    width: "90%",
    maxWidth: 1000,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
    overflow: "auto",
    maxHeight: 800,
  };

  return (
    <MainContainer>
      <Paper
        elevation={5}
        className="m-3 pb-3 text-center flex flex-col items-center"
      >
        <Typography variant="h4" className="p-2">
          User logs
        </Typography>
        <List sx={style}>
          {userLogs?.map((row) => {
            return (
              <Fragment key={row.id}>
                <ListItem
                  secondaryAction={
                    <Typography color="textSecondary">
                      {row.createdAt.toLocaleString("no-NO")}
                    </Typography>
                  }
                >
                  <ListItemText primary={row.message} />
                </ListItem>
                <Divider component="li" />
              </Fragment>
            );
          })}
        </List>
      </Paper>
    </MainContainer>
  );
}

export default LogPage;
