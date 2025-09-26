"use client";
import {
  Button,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { User } from "@prisma/client";
import { useState, useTransition } from "react";
import {
  damageUsers,
  giveArenatokenToUsers,
  giveGoldToUsers,
  giveManaToUsers,
  giveXpToUsers,
  healUsers,
} from "@/data/admin/adminPowers";
import { useRouter } from "next/navigation";
import UserList from "./UserList";
import Checkbox from "@mui/material/Checkbox";
import { toast } from "react-toastify";

export default function ListControls({ users }: { users: User[] }) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [value, setValue] = useState<number>(3);
  const [isPending, startTransition] = useTransition();
  const [notify, setNotify] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");

  const router = useRouter();

  const handleAdminAction = async (action: string, value: number) => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }

    // prepend "Reason:" if reason is defined
    let reasonString = reason;
    if (reason) {
      reasonString = "Reason: " + reason;
    }

    startTransition(async () => {
      switch (action) {
        case "heal":
          if (value < 0) {
            toast.error("Negative values are not allowed for healing");
            return;
          }
          const healResult = await healUsers(
            selectedUsers,
            value,
            notify,
            reasonString,
          );

          if (healResult.success) {
            toast.success(healResult.data);
          } else {
            toast.error(healResult.error);
          }

          break;
        case "damage":
          if (value < 0) {
            toast.error("Negative values are not allowed for damage");
            return;
          }
          const damageResult = await damageUsers(
            selectedUsers,
            value,
            notify,
            reasonString,
          );

          if (damageResult.success) {
            toast.success(damageResult.data);
          } else {
            toast.error(damageResult.error);
          }

          break;
        case "xp":
          if (value < 0) {
            const negativeXpResult = await giveXpToUsers(
              selectedUsers,
              value,
              notify,
              reasonString,
            );

            if (negativeXpResult.success) {
              toast.success("XP removed successfully");
            } else {
              toast.error(negativeXpResult.error);
            }

            toast.warning(
              "Warning: Users may end up with negative gemstones.",
              { autoClose: false },
            );
          } else {
            const xpResult = await giveXpToUsers(
              selectedUsers,
              value,
              notify,
              reasonString,
            );

            if (xpResult.success) {
              toast.success(xpResult.data);
            } else {
              toast.error(xpResult.error);
            }
          }
          break;
        case "mana":
          const manaResult = await giveManaToUsers(
            selectedUsers,
            value,
            notify,
            reasonString,
          );

          if (manaResult.success) {
            toast.success(manaResult.data);
          } else {
            toast.error(manaResult.error);
          }

          break;
        case "arenatoken":
          const arenaResult = await giveArenatokenToUsers(
            selectedUsers,
            value,
            notify,
            reasonString,
          );

          if (arenaResult.success) {
            toast.success(arenaResult.data);
          } else {
            toast.error(arenaResult.error);
          }

          break;
        case "gold":
          const goldResult = await giveGoldToUsers(
            selectedUsers,
            value,
            notify,
            reasonString,
          );

          if (goldResult.success) {
            toast.success(goldResult.data);
          } else {
            toast.error(goldResult.error);
          }

          break;
        default:
          toast.error("No action selected");
      }
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex flex-col w-full my-5 m-auto">
        <UserList users={users} setSelectedUsers={setSelectedUsers} />
      </div>

      <Paper elevation={5}>
        <div className="flex flex-col items-center justify-center py-3">
          <FormControlLabel
            sx={{ color: "lightgreen" }}
            control={
              <Checkbox
                size="medium"
                checked={notify}
                onChange={() => setNotify(!notify)}
              />
            }
            label="Notify users on Discord"
          />
          <Typography variant="overline">
            Reason(s) for action (optional)
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Reason(s)"
            type="text"
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <Typography className=" text-center" variant="h6">
          Quick XP actions
        </Typography>
        <div className="flex justify-center py-3 gap-5">
          <Button
            variant="contained"
            onClick={() => handleAdminAction("xp", 50)}
          >
            Coin (50)
          </Button>
          <Button
            variant="contained"
            onClick={() => handleAdminAction("xp", 100)}
          >
            Coin (100)
          </Button>
          <Button
            variant="contained"
            onClick={() => handleAdminAction("xp", 200)}
          >
            Task (200)
          </Button>
          <Button
            variant="contained"
            onClick={() => handleAdminAction("xp", 500)}
          >
            Project (500)
          </Button>
          <Button
            variant="contained"
            onClick={() => handleAdminAction("xp", 1000)}
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
            onClick={() => handleAdminAction("damage", 10)}
          >
            Standard (10)
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAdminAction("damage", 15)}
          >
            Serious (15)
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAdminAction("damage", 20)}
          >
            Bad (20)
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAdminAction("damage", 99)}
          >
            Extreme (99)
          </Button>
        </div>
        <hr className="my-5" />

        <Typography className=" text-center" variant="h6">
          Custom value
        </Typography>
        {value < 0 && (
          <Typography color="error" className="text-center">
            Warning: Removing XP can give negative gemstones to users.
          </Typography>
        )}
        <div className="flex flex-col w-1/3 m-auto text-center items-center justify-center py-3">
          <TextField
            className="w-2/3"
            type="number"
            required
            defaultValue={value}
            onChange={(e) => setValue(+e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div className="grid grid-cols-3 gap-5 py-5 px-5">
          <Button
            variant="outlined"
            color="health"
            disabled={isPending}
            onClick={() => handleAdminAction("damage", value)}
          >
            Damage selected users
          </Button>
          <Button
            variant="outlined"
            color="success"
            disabled={isPending}
            onClick={() => handleAdminAction("heal", value)}
          >
            Heal selected users
          </Button>
          <Button
            variant="outlined"
            color="experience"
            disabled={isPending}
            onClick={() => handleAdminAction("xp", value)}
          >
            Give XP to selected users
          </Button>
          <Button
            variant="outlined"
            color="mana"
            disabled={isPending}
            onClick={() => handleAdminAction("mana", value)}
          >
            Give mana to selected users
          </Button>
          <Button
            variant="outlined"
            color="arenatoken"
            disabled={isPending}
            onClick={() => handleAdminAction("arenatoken", value)}
          >
            Give arenatokens to selected users
          </Button>
          <Button
            variant="outlined"
            color="gold"
            disabled={isPending}
            onClick={() => handleAdminAction("gold", value)}
          >
            Give gold to selected users
          </Button>
        </div>
      </Paper>
    </>
  );
}
