"use client";
import {
  List,
  ListItem,
  Typography,
  ListItemText,
  Divider,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { secureGetClient } from "@/lib/secureFetchClient";
import { Log } from "@tillerquest/prisma/browser";
import { toast } from "react-toastify";

function LogList() {
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(0);
  const [userLogs, setUserLogs] = useState<Log[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const userLogs = await secureGetClient<Log[]>(
        `/admin/logs?limit=${limit}&offset=${offset}`,
      );

      if (!userLogs.ok) {
        toast.error(`Error fetching logs: ${userLogs.error}`);
        return;
      }
      setUserLogs(userLogs.data);
    };

    fetchLogs();
  }, [limit, offset, page]);

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(event.target.value as number);
  };

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
    <List sx={style}>
      {userLogs.map((row) => {
        return (
          <Fragment key={row.id}>
            <ListItem
              secondaryAction={
                <Typography color="textSecondary">
                  {new Date(row.createdAt).toLocaleString("no-NO")}
                </Typography>
              }
            >
              <ListItemText primary={row.message} />
            </ListItem>
            <Divider component="li" />
          </Fragment>
        );
      })}
      <div>
        <Button
          disabled={offset === 0}
          onClick={() => {
            setOffset(offset - limit);
            setPage(page - 1);
          }}
        >
          Previous
        </Button>
        <span className="mx-2">Page {page + 1}</span>
        <Button
          disabled={userLogs.length < limit}
          onClick={() => {
            setOffset(offset + limit);
            setPage(page + 1);
          }}
        >
          Next
        </Button>
      </div>
      <FormControl>
        <InputLabel>Limit</InputLabel>
        <Select value={limit} label="Limit" onChange={handleLimitChange}>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
          <MenuItem value={200}>200</MenuItem>
          <MenuItem value={400}>400</MenuItem>
        </Select>
      </FormControl>
    </List>
  );
}

export default LogList;
