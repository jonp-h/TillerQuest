"use client";
import { validateUserUpdate } from "@/data/edgeRuntime/userUpdateValidation";
import { updateProfile } from "@/data/user/updateUser";
import { UserProfile } from "@/types/users";
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
      archiveConsent,
    });

    // if the data is a string, it is an error message
    if (typeof validatedData == "string") {
      toast.error(validatedData);
      setLoading(false);
      return;
    }

    toast.promise(
      updateProfile(user.id, {
        username: validatedData.username,
        publicHighscore: validatedData.publicHighscore,
        archiveConsent: validatedData.archiveConsent,
      }),
      {
        pending: "Updating profile...",
        success: {
          render: ({ data }) => {
            return data;
          },
        },
        error: {
          render: ({ data }) => {
            return data instanceof Error
              ? data.message
              : "Something went wrong";
          },
        },
      },
    );

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
      <Paper
        elevation={2}
        className="flex flex-col mt-10 p-10 gap-5 w-full mx-auto items-center"
      >
        <div className="flex gap-3">
          <TextField
            label="Username"
            defaultValue={user.username}
            onChange={(e) => setUsername(e.target.value)}
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
            available to validated students and game masters.
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
        data is deleted when a user is no longer a student. <br /> If you want
        to delete your account before this time, please contact a game master.
        Please note that this action is irreversible and all your data will be
        permanently deleted.
      </Typography>
    </Paper>
  );
}

export default ProfileSettingsForm;
