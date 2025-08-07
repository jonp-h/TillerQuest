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
import { startGuildBattle } from "@/data/dungeons/dungeon";

function ProfileSettingsForm({
  userId,
  guild,
}: {
  userId: string;
  guild: {
    name: string;
    schoolClass: $Enums.SchoolClass | null;
    level: number;
    guildLeader: string | null;
    nextGuildLeader: string | null;
    enemies: {
      name: string;
      health: number;
    }[];
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

  const fighting = guild.enemies && guild.enemies.length > 0;

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
        pending: "Updating guildname...",
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

  const handleStartBattle = async () => {
    setLoading(true);

    await toast
      .promise(startGuildBattle(userId), {
        pending: "Starting battle...",
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
        <Paper variant="outlined" className="flex flex-col gap-3 p-5 w-full">
          <Typography variant="h2" align="center">
            {guild.name}
          </Typography>
          <Typography variant="h3" className="text-center" color="success">
            Level {guild.level}
          </Typography>
        </Paper>
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
        <div className="text-center items-center">
          <Typography
            variant="h6"
            className="text-center"
            color="text.secondary"
          >
            Guild Battle
          </Typography>
          {!fighting && (
            <DialogButton
              buttonText="Start Fighting"
              dialogTitle="Start Fighting"
              dialogContent={
                "Are you sure you want to enter a battle? When you start fighting, you cannot stop until you defeat the enemy."
              }
              dialogFunction={handleStartBattle}
              buttonVariant="contained"
              color="error"
              disabled={loading || fighting || guild.guildLeader !== userId}
              agreeText="Start Battle"
              disagreeText="Cancel"
            />
          )}
          <Typography variant="body1" className="text-center" color="warning">
            {fighting
              ? "Your guild is currently in a battle. Enter the dungeons to help your guild win!"
              : "Your guild is not currently in a battle."}
          </Typography>
        </div>
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
