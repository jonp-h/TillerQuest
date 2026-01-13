"use client";
import {
  TextField,
  Typography,
  Paper,
  Button,
  Tooltip,
  Box,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import DialogButton from "@/components/DialogButton";
import MiniatureProfile from "@/components/MiniatureProfile";
import { CloudUpload, HourglassEmpty } from "@mui/icons-material";
import Image from "next/image";
import { GuildSettings } from "./types";
import { securePostClient, secureUploadClient } from "@/lib/secureFetchClient";
import GuildAvatar from "@/components/GuildAvatar";

function ProfileSettingsForm({
  userId,
  guild,
}: {
  userId: string;
  guild: GuildSettings;
}) {
  const [name, setName] = useState(guild.name);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasPendingUpload = guild.imageUploads.length > 0;
  const fighting = guild.enemies && guild.enemies.length > 0;

  const allEnemiesAreDefeated =
    guild.enemies && guild.enemies.every((enemy) => enemy.health <= 0);
  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);

    const result = await securePostClient<string>(
      `/guilds/${guild.name}/name`,
      {
        newName: name,
      },
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    setLoading(false);
    router.refresh();
  };

  const handleStartBattle = async () => {
    setLoading(true);

    const result = await securePostClient<string>(
      `/guilds/${guild.name}/battles`,
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    setLoading(false);
    router.refresh();
  };

  const vote = async () => {
    setLoading(true);

    const result = await securePostClient<string>(
      `/users/${userId}/guild/battles/vote`,
      {
        guildName: guild.name,
      },
    );

    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }

    setLoading(false);
    router.refresh();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Client-side validation
    const maxSize = 4 * 1024 * 1024; // 4MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
      );
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size exceeds 4MB limit.");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const result = await secureUploadClient<string>(
        `/guilds/images`,
        formData,
      );

      if (result.ok) {
        toast.success(result.data);
        setSelectedFile(null);
        setPreviewUrl(null);
        // Reset file input
        const fileInput = document.getElementById(
          "guild-image-upload",
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById(
      "guild-image-upload",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <Paper
      elevation={4}
      className="flex flex-col mt-10 p-10 gap-3 w-full mx-auto items-center lg:w-1/2"
    >
      <Typography variant="h3" component={"h1"}>
        Guild Settings
      </Typography>
      <Paper
        elevation={2}
        className="flex flex-col mt-10 p-10 gap-5 w-full mx-auto items-center"
      >
        {/* Current Guild Logo */}
        <GuildAvatar guild={{ name: guild.name, icon: guild.icon }} />

        <Typography variant="h2" align="center">
          {guild.name}
        </Typography>
        <Typography variant="h3" className="text-center" color="success">
          Level {guild.level}
        </Typography>

        <Paper
          elevation={1}
          className="flex flex-col gap-5 p-5 w-full items-center"
        >
          <TextField
            label="Guild Name"
            color="secondary"
            className="w-1/2"
            defaultValue={guild.name}
            disabled={guild.guildLeader !== userId}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <DialogButton
              buttonText="Update guild name"
              dialogTitle="Update guild name"
              dialogContent={
                <>Are you sure you want to change the guild name?</>
              }
              dialogFunction={handleUpdate}
              buttonVariant="contained"
              disabled={loading || guild.guildLeader !== userId}
              agreeText="Update"
              disagreeText="Cancel"
            />
          </div>
        </Paper>

        {/* Pending Upload Notice - Visible to All Members */}
        {hasPendingUpload && (
          <Alert
            severity="info"
            icon={<HourglassEmpty />}
            sx={{ width: "100%" }}
          >
            <Typography variant="body1" fontWeight="bold">
              Image Upload Pending Review
            </Typography>
            <Typography variant="body2">
              A new guild logo has been uploaded and is awaiting approval from a
              game master.
            </Typography>
          </Alert>
        )}

        {/* Image Upload Section - Only for Guild Leader and No Pending Uploads */}
        {!hasPendingUpload && (
          <Paper
            elevation={1}
            sx={{
              p: 3,
              width: "100%",
            }}
          >
            <Typography variant="h6" gutterBottom align="center">
              <CloudUpload sx={{ mr: 1, verticalAlign: "middle" }} />
              Upload Guild Logo
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Upload a custom guild logo. Images will be reviewed by game
              masters before being published. Custom logos that demonstrate
              creativity and effort are more likely to be approved.
              <br />
              <strong>Requirements:</strong> JPG, PNG, GIF, or WebP • Max 4MB
            </Alert>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              {/* File Input */}
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                disabled={loading || guild.guildLeader !== userId}
              >
                Select Image
                <input
                  id="guild-image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  hidden
                />
              </Button>

              {/* Preview */}
              {previewUrl && (
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Preview
                  </Typography>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      margin: "0 auto",
                      maxWidth: "200px",
                      maxHeight: "200px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      border: "2px solid rgba(255,255,255,0.2)",
                    }}
                    width={200}
                    height={200}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {selectedFile?.name} (
                    {(selectedFile?.size! / 1024).toFixed(2)} KB)
                  </Typography>
                </Box>
              )}

              {/* Upload Actions */}
              {selectedFile && (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleImageUpload}
                    disabled={loading}
                    startIcon={<CloudUpload />}
                  >
                    {loading ? "Uploading..." : "Upload Image"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClearSelection}
                    disabled={loading || guild.guildLeader !== userId}
                  >
                    Clear
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        <div className="text-center items-center flex flex-col gap-2">
          <Typography
            variant="h6"
            className="text-center"
            color="text.secondary"
          >
            Guild Battle
          </Typography>
          {allEnemiesAreDefeated && (
            <Tooltip
              title={`${guild.members.length - 1} votes required to start the next battle. Only the guild leader can start a battle.`}
              placement="top"
            >
              <Button variant="outlined" color="success" onClick={vote}>
                Vote to enter the next battle ({guild.nextBattleVotes.length} /{" "}
                {guild.members.length - 1} votes)
              </Button>
            </Tooltip>
          )}
          {!fighting && (
            <DialogButton
              buttonText="Start battle"
              dialogTitle="Start battle"
              dialogContent={
                "Are you sure you want to enter a battle? All guildmembers will be attacked once every day until the enemy has been defeated. When you start fighting, you cannot stop until you defeat the enemy."
              }
              dialogFunction={handleStartBattle}
              buttonVariant="contained"
              color="warning"
              disabled={loading || fighting || guild.guildLeader !== userId}
              agreeText="Start Battle"
              disagreeText="Cancel"
            />
          )}
          <Typography variant="body1" className="text-center" color="warning">
            {allEnemiesAreDefeated
              ? "All enemies are defeated! A new battle can be started if enough guildmembers agree to take the risk. All guildmembers will be attacked once every day until the enemy has been defeated. When you start fighting, you cannot stop until you defeat the enemy."
              : fighting
                ? "Your guild is currently in a battle. Enter the dungeons to help your guild win!"
                : "Your guild is not currently in a battle. Level up the guild by winning battles! All guildmembers will be attacked once every day until the enemy has been defeated."}
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
