import { getLogsByUserId } from "@/data/log/getLog";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";

async function Log(userID: { userId: string }) {
  const userLogs = await getLogsByUserId(userID.userId);

  const style = {
    p: 0,
    width: "90%",
    maxWidth: 1000,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
    overflow: "auto",
    maxHeight: 400,
  };

  return (
    <Paper
      elevation={5}
      className="m-3 pb-3 text-center flex flex-col items-center"
    >
      <Typography variant="h4" className="p-2">
        Log
      </Typography>
      <List sx={style}>
        {userLogs?.map((row) => {
          return (
            <React.Fragment key={row.id}>
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
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}

export default Log;
