"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button, LinearProgress, Typography } from "@mui/material";
import { diceSettings } from "@/lib/diceSettings";
import DiceBox from "@3d-dice/dice-box";

function Enemy() {
  const [health, setHealth] = useState<number>(100);

  const [diceBox, setDiceBox] = useState<DiceBox | null>(null);
  const [thrown, setThrown] = useState<boolean>(false);

  const initializeDiceBox = async () => {
    try {
      const newDiceBox = new DiceBox(diceSettings);
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
    setThrown(true);
    diceBox
      .roll("1d20")
      .then(
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
        ) => setHealth(health - results[0].value),
      )
      .finally(() => setThrown(false));
  };

  return (
    <>
      <div
        style={{
          backgroundImage: "url(/dungeons/forest.png)",
          backgroundSize: "cover",
          height: "80vh",
          width: "70%",
          borderRadius: "15px",
        }}
        className="m-auto"
      >
        <div className="flex flex-col items-center justify-center pt-60 text-center animate-move-up-down">
          <div className="w-1/5 bg-black/40 p-3 rounded-xl shadow-lg backdrop-blur-sm">
            <Typography variant="h5" className="text-center">
              Spillutvikling
            </Typography>
            <LinearProgress
              color="health"
              variant="determinate"
              value={(health / 100) * 100}
            />
          </div>
          <Image
            src="/dungeons/slug.png"
            alt="Enemy"
            width={200}
            height={200}
            draggable={false}
          />
        </div>
      </div>
      <div className="flex justify-center p-2">
        <Button
          onClick={rollDice}
          variant="contained"
          color="primary"
          disabled={!diceBox || thrown}
        >
          Roll Dice
        </Button>
      </div>
    </>
  );
}

export default Enemy;
