import {
  LinearProgress,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { User } from "@prisma/client";
import Image from "next/image";
import React from "react";

export default function UserList({
  user,
  selectedUsers,
  setSelectedUsers,
}: {
  user: User;
  selectedUsers: User[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<User[]>>;
}) {
  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    user: User,
  ) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(
        selectedUsers.filter((selectedUser) => selectedUser !== user),
      );
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <ListItemButton
      selected={selectedUsers.includes(user)}
      onClick={(event) => handleListItemClick(event, user)}
    >
      <ListItemAvatar>
        <div className="p-1 bg-slate-700 rounded-full mr-2">
          <Image
            className="rounded-full"
            src={"/classes/" + user.image + ".png"}
            alt={user.username ?? "User"}
            width={50}
            height={50}
          />
        </div>
      </ListItemAvatar>
      <ListItemText
        primary={
          <div className="">
            <Typography variant="h6">
              {user.name ?? ""}{" "}
              <span className=" text-blue-400 font-bold">
                {'"' + user.username + '"'}
              </span>{" "}
              {user.lastname}
            </Typography>
          </div>
        }
        secondary={
          <div className="flex flex-col">
            <span className="text-base text-red-400">
              HP: {user.hp} / {user.hpMax}
            </span>
            <LinearProgress
              variant="determinate"
              value={(user.hp / user.hpMax) * 100}
              color="health"
            />
            <span className="text-base text-blue-400">
              HP: {user.mana} / {user.manaMax}
            </span>
            <LinearProgress
              variant="determinate"
              value={(user.mana / user.manaMax) * 100}
              color="mana"
            />
            <div className="flex gap-5">
              <span className="text-base text-orange-400">
                XP: {user.xp} / {Math.ceil(user.xp / 1000) * 1000}
              </span>
              <span className=" text-base text-green-400">
                Level: {user.level}
              </span>
            </div>
            <LinearProgress
              variant="determinate"
              value={(user.xp % 1000) / 10}
              color="experience"
            />
          </div>
        }
      />
    </ListItemButton>
  );
}
