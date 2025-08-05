"use client";
import DialogButton from "@/components/DialogButton";
import { adminUpdateApplicationSettings } from "@/data/admin/gameSettings";
import { TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function GameSettingsForm({
  userId,
  setting,
}: {
  userId: string;
  setting: {
    createdAt: Date;
    updatedAt: Date;
    value: string;
    key: string;
  };
}) {
  const [value, setValue] = useState<string>(setting.value);

  const router = useRouter();

  const handleChange = async () => {
    await toast.promise(
      adminUpdateApplicationSettings(userId, { key: setting.key, value }),
      {
        pending: "Updating user...",
        success: {
          render: ({ data }) => {
            return data;
          },
        },
        error: {
          render({ data }) {
            return data instanceof Error
              ? `${data.message}`
              : "An error occurred while updating the user.";
          },
        },
      },
    );
    router.refresh();
  };

  return (
    <div className="flex gap-5 items-center w-full">
      <Typography variant="h6">{setting.key}:</Typography>
      <TextField
        variant="standard"
        label="Value"
        value={value}
        fullWidth
        onChange={(e) => setValue(e.target.value)}
      />
      <DialogButton
        buttonText="Update"
        dialogTitle={"Update setting: " + setting.key}
        dialogContent={"Are you sure you want to update this setting?"}
        agreeText="Update"
        disagreeText="Cancel"
        buttonVariant="contained"
        dialogFunction={handleChange}
      />
    </div>
  );
}

export default GameSettingsForm;
