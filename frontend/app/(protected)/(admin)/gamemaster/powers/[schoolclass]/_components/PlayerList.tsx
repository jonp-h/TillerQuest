"use client";

import { FullUser } from "@/types/users";
import PlayerCard from "./PlayerCard";
import { toast } from "react-toastify";
import { startTransition, useState } from "react";
import { securePostClient } from "@/lib/secureFetchClient";
import { useRouter } from "next/navigation";
import {
  Checkbox,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

function PlayerList({ users }: { users: FullUser[] }) {
  const [notify, setNotify] = useState(false);
  const [xpValue, setXpValue] = useState(100);
  const [damageValue, setDamageValue] = useState(3);

  const router = useRouter();

  const handleAdminAction = async (action: string, userId: string) => {
    startTransition(async () => {
      switch (action) {
        case "damage":
          if (damageValue < 0) {
            toast.error("Negative values are not allowed for damage");
            return;
          }
          const damageResult = await securePostClient<{
            message: string;
            result: string[];
          }>("/admin/powers/damage", {
            userIds: [userId],
            value: damageValue,
            notify,
            reason: "Naughty",
          });

          if (damageResult.ok) {
            toast.success(damageResult.data.message);
          } else {
            toast.error(damageResult.error);
          }

          break;
        case "xp":
          if (xpValue < 0) {
            const negativeXpResult = await securePostClient<{
              message: string;
              result: string[];
            }>("/admin/powers/give-xp", {
              userIds: [userId],
              value: xpValue,
              notify,
              reason: "Removing XP",
            });

            if (negativeXpResult.ok) {
              toast.success("XP removed successfully");
            } else {
              toast.error(negativeXpResult.error);
            }

            toast.warning(
              "Warning: Users may end up with negative gemstones.",
              { autoClose: false },
            );
          } else {
            const xpResult = await securePostClient<{
              message: string;
              result: string[];
            }>("/admin/powers/give-xp", {
              userIds: [userId],
              value: xpValue,
              notify,
              reason: "Good behavior",
            });

            if (xpResult.ok) {
              toast.success(xpResult.data.message);
            } else {
              toast.error(xpResult.error);
            }
          }
          break;

        default:
          toast.error("No action selected");
      }
      router.refresh();
    });
  };

  return (
    <Paper elevation={4} className="mx-30">
      <div className="flex justify-evenly gap-3 items-center p-5">
        <div className="flex flex-col gap-3">
          <Typography variant="overline" className="text-center">
            XP to give:
          </Typography>

          <TextField
            className="w-25"
            type="number"
            required
            defaultValue={xpValue}
            onChange={(e) => setXpValue(+e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Typography variant="overline" className="text-center">
            Damage to give:
          </Typography>

          <TextField
            className="w-25"
            type="number"
            required
            defaultValue={damageValue}
            onChange={(e) => setDamageValue(+e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </div>
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
      </div>
      <div className="p-10 grid grid-cols-2 lg:grid-cols-5 gap-5">
        {users.map((user) => (
          <PlayerCard
            key={user.id}
            user={user}
            adminAction={handleAdminAction}
          />
        ))}
      </div>
    </Paper>
  );
}

export default PlayerList;
