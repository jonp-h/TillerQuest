"use client";
import {
  Button,
  Input,
  List,
  ListSubheader,
  Paper,
  TextField,
} from "@mui/material";
import { User } from "@prisma/client";

import React from "react";
import UserList from "./UserList";
import {
  damageUsers,
  giveManaToUsers,
  giveXpToUsers,
  healUsers,
} from "@/data/admin";

export default function ListControls({ users }: { users: User[] }) {
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [value, setValue] = React.useState<number>(4);
  const [feedback, setFeedback] = React.useState<string>("");

  const selectAllUsers = () => {
    if (users.length === selectedUsers.length) {
      setSelectedUsers([]);
      return;
    }
    setSelectedUsers(users);
  };

  const handleAdminAction = async (action: string) => {
    switch (action) {
      case "heal":
        setFeedback(await healUsers(selectedUsers, value));
        break;
      case "damage":
        setFeedback(await damageUsers(selectedUsers, value));
        break;
      case "xp":
        setFeedback(await giveXpToUsers(selectedUsers, value));
        break;
      case "mana":
        setFeedback(await giveManaToUsers(selectedUsers, value));
        break;
      default:
        setFeedback("No action selected");
    }
  };

  return (
    <>
      <Paper elevation={3}>
        <div className="flex justify-center py-3">
          <Button variant="text" color="secondary" onClick={selectAllUsers}>
            Select all users
          </Button>
        </div>
      </Paper>
      <List>
        <div className="flex flex-col w-3/4 overflow-auto m-auto">
          {users.map((user) => (
            <UserList
              key={user.id}
              user={user}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
            />
          ))}
        </div>
      </List>
      <Paper elevation={5}>
        <div className="flex flex-col w-1/3 m-auto text-center items-center justify-center py-3">
          {feedback && <p className="text-green-500">{feedback}</p>}
          <TextField
            className="w-1/3"
            type="number"
            required
            autoFocus
            value={value}
            onChange={(e) => setValue(+e.target.value)}
          />
        </div>
        <div className="flex gap-5 py-5 px-1">
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleAdminAction("damage")}
          >
            Damage selected users
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleAdminAction("heal")}
          >
            Heal selected users
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleAdminAction("xp")}
          >
            Give XP to selected users
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleAdminAction("mana")}
          >
            Give mana to selected users
          </Button>
        </div>
      </Paper>
    </>
  );
}
