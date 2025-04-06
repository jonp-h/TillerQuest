"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { diceSettings } from "@/lib/diceSettings";
import { toast } from "react-toastify";
import DiceBox from "@3d-dice/dice-box-threejs";
import Enemy from "./Enemy";

interface EnemyProps {
  index: number;
  name: string;
  health: number;
}

function Battleground() {
  const [enemies, setEnemies] = useState<EnemyProps[]>(
    Array.from({ length: 3 }, (_, index) => ({
      index,
      name: `Enemy ${index + 1}`,
      health: 100,
    })),
  );
  const [selectedEnemy, setSelectedEnemy] = useState<number>(0);

  const [diceBox, setDiceBox] = useState<DiceBox | null>(null);
  const [thrown, setThrown] = useState<boolean>(false);

  const initializeDiceBox = async () => {
    try {
      const newDiceBox = new DiceBox("#dice-canvas", diceSettings);
      await newDiceBox.initialize();
      setDiceBox(newDiceBox);
    } catch (error) {
      console.error("Error initializing DiceBox:", error);
    }
  };

  // Delay of 500ms to prevent the dice box from rendering before the component is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeDiceBox();
    }, 1000);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

  const rollDice = async () => {
    if (!diceBox) {
      initializeDiceBox();
      toast.info("Preparing dice..", { autoClose: 1000 });
      return;
    } else if (diceBox) {
      diceBox.clearDice();
      // TODO: enable custom colorsets for different abilities
      // diceBox.updateConfig({
      //   ...diceSettings,
      //   theme_customColorset: colorsets.fire,
      // });
    }

    setThrown(true);

    if (!diceBox) {
      toast.error("Dice failed to initialize");
      return;
    }
    diceBox
      .roll("1d20")
      .then((results) => {
        setEnemies((prevEnemies) =>
          prevEnemies.map((enemy, index) =>
            index === selectedEnemy
              ? { ...enemy, health: enemy.health - results.total }
              : enemy,
          ),
        );
      })
      .finally(() => {
        setThrown(false);
      });
  };

  return (
    <>
      <div
        id="dice-canvas"
        className="fixed mt-24 z-10 inset-0 w-full h-11/12 pointer-events-none"
      />
      <div
        style={{
          backgroundImage: "url(/dungeons/forest.png)",
          backgroundSize: "cover",
          height: "80vh",
          width: "70%",
          borderRadius: "15px",
        }}
        className="m-auto flex justify-evenly"
      >
        {enemies.map((enemy, index) => (
          <Enemy
            enemy={enemy}
            selectedEnemy={selectedEnemy}
            setSelectedEnemy={setSelectedEnemy}
            key={index}
          />
        ))}
      </div>
      <div className="flex justify-center p-2">
        <Button
          onClick={rollDice}
          variant="contained"
          color="primary"
          disabled={thrown}
        >
          Roll Dice
        </Button>
      </div>
    </>
  );
}

export default Battleground;
