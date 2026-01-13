"use client";
import { ArrowBack } from "@mui/icons-material";
import {
  TextField,
  Switch,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import DialogButton from "@/components/DialogButton";
import { UserSettings } from "./types";
import { securePatchClient } from "@/lib/secureFetchClient";

function ProfileSettingsForm({ user }: { user: UserSettings }) {
  const [newUsername, setNewUsername] = useState(user.username);
  const [publicHighscore, setPublicHighscore] = useState(user.publicHighscore);
  const [archiveConsent, setArchiveConsent] = useState(user.archiveConsent);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);

    const result = await securePatchClient<string>(
      `/users/${user.username}/settings`,
      {
        newUsername: newUsername,
        publicHighscore,
        archiveConsent,
      },
    );

    if (result.ok) {
      toast.success(result.data);
      setLoading(false);
      router.push(`/profile/${newUsername}/settings`);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      toast.error(result.error);
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={4}
      className="flex flex-col mt-10 p-10 gap-3 w-full mx-auto items-center lg:w-1/2"
    >
      <Typography variant="h3" component={"h1"} sx={{ paddingBottom: 3 }}>
        Profile Settings
      </Typography>
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
      <Paper
        elevation={2}
        className="flex flex-col mt-10 p-10 gap-5 w-full mx-auto items-center"
      >
        <div className="flex gap-3">
          <TextField
            label="Username"
            color="secondary"
            defaultValue={user.username}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>
        <Paper
          elevation={1}
          className="flex flex-col justify-center items-center p-4"
        >
          <Typography variant="body1" className="text-center">
            Do you want to be visible on public highscore lists? <br />
            (Default option: No)
          </Typography>
          <Switch
            checked={publicHighscore}
            onChange={() => setPublicHighscore(!publicHighscore)}
          />
          <Typography variant="body1">
            {publicHighscore ? "Yes" : "No"}
          </Typography>
        </Paper>
        <Paper
          elevation={1}
          className="flex flex-col justify-center items-center gap-3 p-4"
        >
          <Typography variant="body1" className="text-center">
            Do you want your user profile to remain in the halls of fame after
            the end of your studies?
            <br /> (Default option: No)
          </Typography>
          <Switch
            checked={archiveConsent}
            onChange={() => setArchiveConsent(!archiveConsent)}
          />
          <Typography variant="body1">
            {archiveConsent
              ? "Yes, I want my profile to remain in the halls of fame"
              : "No, I want my data to be deleted"}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            className="text-center py-3"
          >
            Only generic information about username, XP, level, class and
            achievements will be displayed. The information will only be
            available to validated users and game masters.
          </Typography>
        </Paper>
        <DialogButton
          buttonText="Update Profile"
          dialogTitle="Update Profile"
          dialogContent="Are you sure you want to update your profile?"
          dialogFunction={handleUpdate}
          buttonVariant="contained"
          disabled={loading}
          agreeText="Update"
          disagreeText="Cancel"
        />
      </Paper>
      <Typography variant="caption" color="warning" className="text-center">
        Account deletion is possible at any time. By default all accounts and
        data are deleted when a user is no longer a student. <br /> If you want
        to delete your account before this time, please contact a game master.
        Please note that this action is irreversible and all your data will be
        permanently deleted.
      </Typography>
    </Paper>
  );
}

export default ProfileSettingsForm;
