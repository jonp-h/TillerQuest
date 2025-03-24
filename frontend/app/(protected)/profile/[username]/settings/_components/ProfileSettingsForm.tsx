"use client";
import { validateUserUpdate } from "@/data/validators/userUpdateValidation";
import { updateProfile } from "@/data/user/updateUser";
import { UserProfile } from "@/types/users";
import { ArrowBack } from "@mui/icons-material";
import {
  TextField,
  Button,
  Switch,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

function ProfileSettingsForm({ user }: { user: UserProfile }) {
  const [username, setUsername] = useState(user.username);
  const [publicHighscore, setPublicHighscore] = useState(user.publicHighscore);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    const validatedData = await validateUserUpdate(user.id, {
      username,
      publicHighscore,
    });

    // if the data is a string, it is an error message
    if (typeof validatedData == "string") {
      toast.error(validatedData);
      setLoading(false);
      return;
    }

    await updateProfile(user.id, {
      username: validatedData.username,
      publicHighscore: validatedData.publicHighscore,
    });
    toast.success("Profile updated");
    router.push(`/profile/${validatedData.username}/settings`);
    setLoading(false);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <Paper
      elevation={4}
      className="flex flex-col mt-10 p-10 gap-3 w-full mx-auto items-center lg:w-1/2"
    >
      <h1 className="text-4xl pb-6">Profile Settings</h1>
      <div className="self-start absolute">
        <IconButton
          disableRipple
          sx={{
            width: "2rem",
            height: "2rem",
          }}
        >
          <Link href={`/profile/${user.username}`}>
            <ArrowBack
              sx={{
                fontSize: "3rem",
                ":hover": { color: "white", cursor: "pointer" },
                color: "grey",
              }}
              className="cursor-pointer"
            />
          </Link>
        </IconButton>
      </div>
      <div className="flex gap-3">
        <TextField
          label="Username"
          defaultValue={user.username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="flex flex-col justify-center items-center">
        <Typography variant="body1">
          Do you want to be visible on public highscore lists?
        </Typography>
        <Switch
          checked={publicHighscore}
          onChange={() => setPublicHighscore(!publicHighscore)}
        />
        <Typography variant="body1">
          {publicHighscore ? "Yes" : "No"}
        </Typography>
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleUpdate()}
        disabled={loading}
      >
        Update
      </Button>
    </Paper>
  );
}

export default ProfileSettingsForm;
