"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Casino, ErrorOutline } from "@mui/icons-material";
import { User } from "@prisma/client";
import { resurrectUsers } from "@/data/admin/resurrectUser";
import DiceBox from "@3d-dice/dice-box";
import { useRouter } from "next/navigation";

export default function DeathCard({ user }: { user: User }) {
  const [number, setNumber] = React.useState<number | null>(0);
  const router = useRouter();

  const handleRessurect = async (effect: string) => {
    resurrectUsers({
      userId: user.id,
      effect: effect,
    }).then(() => router.refresh());
  };

  const [diceBox, setDiceBox] = useState<DiceBox | null>(null);

  const initializeDiceBox = async () => {
    try {
      const newDiceBox = new DiceBox({
        container: "#dice-canvas", // required
        assetPath: "/assets/", // required
        themeColor: "#581c87",
        scale: 6,
        gravity: 0.5,
        restitution: 0.3,
        settleTimeout: 6000,
      });
      await newDiceBox.init();
      setDiceBox(newDiceBox);
    } catch (error) {
      console.error("Error initializing DiceBox:", error);
    }
  };

  useEffect(() => {
    initializeDiceBox();
  }, []);

  const rollDice = async () => {
    if (!diceBox)
      return; // TODO: make dice rerollable
    else await diceBox.clear();
    diceBox.roll("1d6").then(
      (
        results: {
          data: undefined;
          dieType: string;
          groupId: number;
          rollId: number;
          sides: number;
          theme: string;
          themeColor: string;
          value: number;
        }[],
      ) => setNumber(results[0].value),
    );
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
              Death Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleRessurect("free")}
            >
              Free resurrection
            </Button>
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
