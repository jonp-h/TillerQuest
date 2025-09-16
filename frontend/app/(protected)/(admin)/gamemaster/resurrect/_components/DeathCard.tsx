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
import React, { useEffect, useState } from "react";
import { Casino, ErrorOutline } from "@mui/icons-material";
import { User } from "@prisma/client";
import { resurrectUsers } from "@/data/admin/resurrectUser";
import DiceBox from "@3d-dice/dice-box-threejs";
import { useRouter } from "next/navigation";
import { diceSettings } from "@/lib/diceSettings";
import { toast } from "react-toastify";
import DialogButton from "@/components/DialogButton";

export default function DeathCard({ user }: { user: User }) {
  const [number, setNumber] = React.useState<number | null>(0);
  const router = useRouter();

  const handleRessurect = async (effect: string) => {
    const result = await resurrectUsers({
      userId: user.id,
      effect: effect,
    });

    if (result.success) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }
    router.refresh();
  };

  const [diceBox, setDiceBox] = useState<DiceBox | null>(null);

  const initializeDiceBox = async () => {
    const diceContainer = document.querySelector("#dice-canvas");
    if (diceContainer) {
      const existingCanvases = diceContainer.querySelectorAll("canvas");
      if (existingCanvases.length > 0) {
        console.info("Removing existing dice canvases");
        existingCanvases.forEach((canvas) => canvas.remove());
      }
    }

    try {
      const newDiceBox = new DiceBox("#dice-canvas", diceSettings);
      await newDiceBox.initialize();
      console.info("DiceBox initialized successfully");
      setDiceBox(newDiceBox);
    } catch (error) {
      console.error("Error initializing DiceBox:", error);
    }
  };

  useEffect(() => {
    initializeDiceBox();
  }, []);

  const rollDice = async () => {
    if (!diceBox) {
      toast.error("Dice failed to initialize");
      return;
    }
    // TODO: check if dice does not work on big screens because of client side
    diceBox.roll("1d6").then((results) => setNumber(results.total));
  };

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
          <div className="flex flex-col items-center p-4 gap-2">
            <Button
              variant="contained"
              color="error"
              endIcon={<Casino />}
              onClick={() => rollDice()}
            >
              {diceBox ? "Death Save" : "Initialize Dice"}
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
            <Button
              variant="contained"
              color={number === 1 ? "error" : "warning"}
              endIcon={<ErrorOutline />}
              onClick={() => handleRessurect("criticalMiss")}
            >
              1: Everything
            </Button>
            <Button
              variant="contained"
              color={number === 2 ? "error" : "warning"}
              endIcon={<ErrorOutline />}
              onClick={() => handleRessurect("phone")}
            >
              2: Phone
            </Button>
            <Button
              variant="contained"
              color={number === 3 ? "error" : "warning"}
              endIcon={<ErrorOutline />}
              onClick={() => handleRessurect("xp")}
            >
              3: Reduced XP
            </Button>
            <Button
              variant="contained"
              color={number === 4 ? "error" : "warning"}
              endIcon={<ErrorOutline />}
              onClick={() => handleRessurect("quiz")}
            >
              4: Pop-Quiz
            </Button>
            <Button
              variant="contained"
              color={number === 5 ? "error" : "warning"}
              endIcon={<ErrorOutline />}
              onClick={() => handleRessurect("hat")}
            >
              5: Hat
            </Button>
            <Button
              variant="contained"
              color={number === 6 ? "error" : "warning"}
              endIcon={<ErrorOutline />}
              onClick={() => handleRessurect("criticalHit")}
            >
              6: Freedom
            </Button>
          </div>
        </Box>
      </Paper>
    </Card>
  );
}
