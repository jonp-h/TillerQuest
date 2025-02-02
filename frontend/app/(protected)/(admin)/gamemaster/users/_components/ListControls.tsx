"use client";
import { Button, List, Paper, TextField, Typography } from "@mui/material";
import { User } from "@prisma/client";
import React from "react";
import UserList from "./UserList";
import {
  damageUsers,
  giveManaToUsers,
  giveXpToUsers,
  healUsers,
} from "@/data/admin/adminPowers";
import { useRouter } from "next/navigation";

export default function ListControls({ users }: { users: User[] }) {
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [value, setValue] = React.useState<number>(4);
  const [feedback, setFeedback] = React.useState<string>("");
  const [isPending, startTransition] = React.useTransition();

  const router = useRouter();

  const selectAllUsers = () => {
    if (users.length === selectedUsers.length) {
      setSelectedUsers([]);
      return;
    }
    setSelectedUsers(users);
  };

  const handleAdminAction = async (action: string, value: number) => {
    startTransition(async () => {
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
      setTimeout(() => {
        router.refresh();
      }, 3000);
    });
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
        <Typography className=" text-center" variant="h6">
          Quick XP actions
        </Typography>
        <div className="flex justify-center py-3 gap-5">
          <Button
            variant="contained"
            onClick={() => handleAdminAction("xp", 100)}
          >
            Coin (100)
          </Button>
          <Button
            variant="contained"
            onClick={() => handleAdminAction("xp", 250)}
          >
            Task (250)
          </Button>
          <Button
            variant="contained"
            onClick={() => handleAdminAction("xp", 500)}
          >
            Project (500)
          </Button>
          <Button
            variant="contained"
            onClick={() => handleAdminAction("xp", 500)}
          >
            Event (1000)
          </Button>
        </div>
        <Typography className=" text-center" variant="h6">
          Quick damage actions
        </Typography>
        <div className="flex justify-center py-3 gap-5">
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAdminAction("damage", 5)}
          >
            Minor (5)
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAdminAction("damage", 5)}
          >
            Standard (10)
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAdminAction("damage", 5)}
          >
            Serious (15)
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAdminAction("damage", 5)}
          >
            Bad (15)
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAdminAction("damage", 5)}
          >
            Extreme (99)
          </Button>
        </div>

        <Typography className=" text-center" variant="h6">
          Custom value
        </Typography>
        <div className="flex flex-col w-1/3 m-auto text-center items-center justify-center py-3">
          {feedback && <p className="text-green-500">{feedback}</p>}
          <TextField
            className="w-2/3"
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
            disabled={isPending}
            onClick={() => handleAdminAction("damage", value)}
          >
            Damage selected users
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={isPending}
            onClick={() => handleAdminAction("heal", value)}
          >
            Heal selected users
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={isPending}
            onClick={() => handleAdminAction("xp", value)}
          >
            Give XP to selected users
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={isPending}
            onClick={() => handleAdminAction("mana", value)}
          >
            Give mana to selected users
          </Button>
        </div>
      </Paper>
    </>
  );
}
