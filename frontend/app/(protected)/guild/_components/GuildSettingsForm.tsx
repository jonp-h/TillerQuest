"use client";
import { TextField, Typography, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import DialogButton from "@/components/DialogButton";
import { $Enums } from "@prisma/client";
import MiniatureProfile from "@/components/MiniatureProfile";
import { validateGuildNameUpdate } from "@/data/validators/guildUpdateValidation";
import { updateGuildname } from "@/data/guilds/updateGuilds";

function ProfileSettingsForm({
  userId,
  guild,
}: {
  userId: string;
  guild: {
    name: string;
    schoolClass: $Enums.SchoolClass | null;
    guildLeader: string | null;
    nextGuildLeader: string | null;
    members: {
      id: string;
      username: string | null;
      title: string | null;
      titleRarity: $Enums.Rarity | null;
      image: string | null;
      hp: number;
      hpMax: number;
      mana: number;
      manaMax: number;
    }[];
  };
}) {
  const [name, setName] = useState(guild.name);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    const validatedData = await validateGuildNameUpdate(userId, name);

    // if the data is a string, it is an error message
    if (typeof validatedData == "string") {
      toast.error(validatedData);
      setLoading(false);
      return;
    }

    await toast
      .promise(updateGuildname(userId, guild.name, validatedData.name), {
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
      })
      .finally(() => {
        setLoading(false);
        router.refresh();
      });
  };

  return (
    <Paper
      elevation={4}
      className="flex flex-col mt-10 p-10 gap-3 w-full mx-auto items-center lg:w-1/2"
    >
      <h1 className="text-4xl">Guild Settings</h1>
      <Paper
        elevation={2}
        className="flex flex-col mt-10 p-10 gap-5 w-full mx-auto items-center"
      >
        <Typography variant="h2" align="center">
          {guild.name}
        </Typography>
        <div className="flex gap-3">
          <TextField
            label="Guild Name"
            defaultValue={guild.name}
            disabled={guild.guildLeader !== userId}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <DialogButton
          buttonText="Update guild name"
          dialogTitle="Update guild name"
          dialogContent={<>Are you sure you want to change the guild name?</>}
          dialogFunction={handleUpdate}
          buttonVariant="contained"
          disabled={loading || guild.guildLeader !== userId}
          agreeText="Update"
          disagreeText="Cancel"
        />
        <Typography variant="h6" className="text-center" color="text.secondary">
          Current guild leader and upcoming guild leader next week:
        </Typography>
        <div className="flex gap-5">
          {guild.members.map((member) => (
            <MiniatureProfile
              key={member.id}
              member={{
                ...member,
                guild: {
                  guildLeader: guild.guildLeader,
                  nextGuildLeader: guild.nextGuildLeader,
                },
              }}
            />
          ))}
        </div>
      </Paper>
    </Paper>
  );
}

export default ProfileSettingsForm;
