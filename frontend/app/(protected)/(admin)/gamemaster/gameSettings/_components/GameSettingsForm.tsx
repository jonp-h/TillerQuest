"use client";
import DialogButton from "@/components/DialogButton";
import { securePatchClient } from "@/lib/secureFetchClient";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function GameSettingsForm({
  setting,
}: {
  setting: {
    createdAt: Date;
    updatedAt: Date;
    value: string;
    key: string;
    description: string | null;
  };
}) {
  const [value, setValue] = useState<string>(setting.value);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();

  const handleChange = async () => {
    const result = await securePatchClient<string>(`/admin/settings`, {
      key: setting.key,
      value,
    });

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between gap-5 items-center w-full">
        <Typography variant="h6">
          {setting.key.replaceAll("_", " ")}:
        </Typography>
        <FormControl sx={{ m: 1, width: "100ch" }} variant="outlined">
          <OutlinedInput
            type={showPassword ? "text" : "password"}
            value={value}
            fullWidth
            onChange={(e) => setValue(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? "hide the password" : "display the password"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
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
      {setting.description && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          {setting.description}
        </Typography>
      )}
    </div>
  );
}

export default GameSettingsForm;
