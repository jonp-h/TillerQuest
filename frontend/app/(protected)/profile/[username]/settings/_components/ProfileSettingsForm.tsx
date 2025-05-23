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
  const [archiveConsent, setArchiveConsent] = useState(user.archiveConsent);
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
      archiveConsent: validatedData.archiveConsent,
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
      <div className="flex flex-col justify-center items-center">
        <Typography variant="body1">
          Do you want your user profile to remain in the halls of fame after the
          end of your studies?
        </Typography>
        <Switch
          checked={archiveConsent}
          onChange={() => setArchiveConsent(!archiveConsent)}
        />
        <Typography variant="body1">
          {archiveConsent
            ? "Yes, I want my profile to remain"
            : "No, I want my profile to be deleted"}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Only generic information about username, XP, level, class and
          achievements will be kept. The information will only be available to
          validated students, and not the general public.
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
