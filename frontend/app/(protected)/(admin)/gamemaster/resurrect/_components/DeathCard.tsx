"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Casino, ErrorOutline } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import DialogButton from "@/components/DialogButton";
import { useDiceBox } from "./ResurrectDiceProvider";
import { securePostClient } from "@/lib/secureFetchClient";
import { AdminDeadUser } from "./types";

export default function DeathCard({ user }: { user: AdminDeadUser }) {
  const [number, setNumber] = useState<number | null>(null);
  const router = useRouter();
  const { diceBox, isReady } = useDiceBox();

  const handleRessurect = async (effect: string) => {
    const result = await securePostClient<string>(
      `/admin/users/${user.id}/resurrect`,
      {
        effect,
      },
    );

    if (result.ok) {
      toast.success(result.data, {
        autoClose: false,
      });
    } else {
      toast.error(result.error);
    }
    router.refresh();
  };

  const rollDice = async () => {
    if (!diceBox) {
      toast.error("Dice failed to initialize");
      return;
    }

    diceBox.clearDice();

    // Roll dice server-side
    const result = await securePostClient<{ roll: number; diceRoll: string }>(
      `/admin/death-saves/roll`,
    );

    if (result.ok) {
      // Display the roll result with animation
      diceBox.roll(`1d12@${result.data.diceRoll}`).then(() => {
        setNumber(result.data.roll);
      });
    } else {
      toast.error(result.error);
    }
  };

  const resurrectionEffects = [
    [1, "Everything", "criticalMiss"],
    [2, "Phone", "phone"],
    [3, "Reduced XP", "xp"],
    [4, "Pop-Quiz", "quiz"],
    [5, "Hat", "hat"],
    [6, "Clean the lab/hub", "clean"],
    [7, "Lose 10% of your current coins", "goldLoss"],
    [8, "Lose all your mana", "manaLoss"],
    [9, "Mundane tasks", "tasks"],
    [10, "Reduced mana", "mana"],
    [
      11,
      "Move to the front of the classroom for the next theory lecture",
      "frontOfClass",
    ],
    [12, "Freedom", "criticalHit"],
  ] as const;

  return (
    <Card sx={{ display: "flex" }}>
      <Paper
        elevation={6}
        sx={{
          display: "center",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            marginTop: "1rem",
          }}
        >
          <CardMedia
            component="img"
            sx={{
              width: 151,
              height: 151,
              justifyContent: "center",
              borderRadius: "999px",
            }}
            image={"/classes/" + user.image + ".png"}
            alt={user.username ?? "user"}
          />
          <CardContent sx={{ flex: "1 0 auto", textAlign: "center" }}>
            <Typography component="div" variant="h5">
              {user.name} <br /> {user.username} <br /> {user.lastname}
            </Typography>
            <Typography
              className="rounded-full"
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              Level: {user.level}
            </Typography>
          </CardContent>
          <Box sx={{ width: "min(100%, 38rem)", p: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                endIcon={<Casino />}
                onClick={() => rollDice()}
                disabled={!isReady}
              >
                {!isReady ? "Prepare dice!" : "Roll Death Save"}
              </Button>
              <DialogButton
                buttonText="Free Resurrection"
                dialogTitle="Free Resurrection"
                dialogContent="Are you sure you want to resurrect this user for free? This will not penalize the guild or user in any way."
                agreeText="Resurrect"
                disagreeText="Cancel"
                buttonVariant="outlined"
                dialogFunction={() => handleRessurect("free")}
              />
            </Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", mt: 2 }}
            >
              Choose a resurrection cost
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1,
              }}
            >
              {resurrectionEffects.map(([roll, label, effect]) => (
                <Button
                  key={roll}
                  fullWidth
                  variant="contained"
                  color={number === roll ? "error" : "warning"}
                  // endIcon={<ErrorOutline />}
                  onClick={() => handleRessurect(effect)}
                  sx={{
                    minHeight: 52,
                    justifyContent: "space-between",
                    textAlign: "left",
                    lineHeight: 1.25,
                  }}
                >
                  {roll}: {label}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Card>
  );
}
