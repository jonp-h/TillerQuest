"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { diceSettings } from "@/lib/diceSettings";
import { toast } from "react-toastify";
import DiceBox from "@3d-dice/dice-box-threejs";
import Enemy from "./Enemy";
import {
  finishTurn,
  getRandomEnemy,
  isTurnFinished,
} from "@/data/games/dungeon";
import { EnemyProps } from "@/types/types";

function Battleground() {
  const [enemy, setEnemy] = useState<EnemyProps | null>(null);
  const [diceBox, setDiceBox] = useState<DiceBox>();
  const [thrown, setThrown] = useState<boolean>(false);
  const [turnFinished, setTurnFinished] = useState<boolean>(false);

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
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchEnemy = async () => {
      try {
        const randomEnemy = await getRandomEnemy();
        setEnemy(
          randomEnemy
            ? {
                ...randomEnemy,
                maxHealth: randomEnemy.maxHealth,
                icon: randomEnemy.icon ?? "/dungeons/slug.png",
              }
            : null,
        );
      } catch (error) {
        console.error("Error fetching enemy:", error);
      }
    };

    fetchEnemy(); // Fetch the enemy on component mount
  }, []);

  const rollDice = async () => {
    console.log(enemy?.health);
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
      .then(async (results) => {
        setEnemy((prevEnemy) =>
          prevEnemy
            ? {
                ...prevEnemy,
                health: prevEnemy.health - results.total,
                maxHealth: prevEnemy.maxHealth, // Ensure maxHealth is preserved
              }
            : null,
        );
        if (!enemy) {
          toast.error("An error has occurred!");
          return;
        }

        await finishTurn(results.total, enemy.name);

        toast.info("Your turn is finished.");
      })
      .finally(() => {
        setThrown(false);
      });
  };
  const punchMonster = async () => {
    if (!diceBox) {
      initializeDiceBox();
      toast.info("Preparing dice..", { autoClose: 1000 });
      return;
    } else if (diceBox) {
      diceBox.clearDice();
    }
    setThrown(true);
    if (!diceBox) {
      toast.error("Dice failed to initialize");
      return;
    }
    diceBox
      .roll("1d6")
      .then((results) => {
        setEnemy((prevEnemy) =>
          prevEnemy
            ? {
                ...prevEnemy,
                health: prevEnemy.health - results.total,
                maxHealth: prevEnemy.maxHealth, // Ensure maxHealth is preserved
              }
            : null,
        );
      })
      .finally(() => {
        setThrown(false);
      });
  };

  useEffect(() => {
    const fetchTurnStatus = async () => {
      const status = await isTurnFinished();
      setTurnFinished(status?.turnFinished || false);
    };

    fetchTurnStatus();
  }, []);

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
        {enemy && (
          <Enemy
            enemy={{
              name: enemy.name,
              health: enemy.health,
              maxHealth: enemy.maxHealth,
              icon: enemy.icon,
              attack: enemy.attack,
              xp: enemy.xp,
              gold: enemy.gold,
            }}
          />
        )}
      </div>
      <div className="flex justify-center p-2">
        <Button
          onClick={rollDice}
          variant="contained"
          color="primary"
          disabled={turnFinished || thrown}
        >
          Roll Dice
        </Button>
        <Button
          onClick={punchMonster}
          variant="contained"
          color="primary"
          disabled={turnFinished || thrown}
        >
          Punch
        </Button>
      </div>
    </>
  );
}

export default Battleground;
