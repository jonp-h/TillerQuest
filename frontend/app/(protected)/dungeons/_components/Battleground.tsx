"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { diceSettings } from "@/lib/diceSettings";
import { toast } from "react-toastify";
import DiceBox from "@3d-dice/dice-box-threejs";
import Enemy from "./Enemy";
import { finishTurn, getEnemy, isTurnFinished } from "@/data/games/dungeon";
import { EnemyProps } from "@/types/types";
import { useRouter } from "next/navigation";

function Battleground() {
  const [enemy, setEnemy] = useState<EnemyProps | null>(null);
  const [diceBox, setDiceBox] = useState<DiceBox>();
  const [thrown, setThrown] = useState<boolean>(false);
  const [turnFinished, setTurnFinished] = useState<boolean>(false);
  const router = useRouter();

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
        const enemy = await getEnemy();
        setEnemy(
          enemy
            ? {
                ...enemy,
                icon: enemy.icon ?? "/dungeons/slug.png",
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
    setThrown(true);
    console.log(enemy?.health);
    console.log("Dicebox current:", diceBox);
    if (!diceBox) {
      initializeDiceBox();
      console.log("Dicebox was null", diceBox);
      toast.info("Preparing dice..", { autoClose: 1000 });
      return;
    } else if (diceBox) {
      console.log("Init Dicebox:", diceBox);
      diceBox.clearDice();
      // TODO: enable custom colorsets for different abilities
      // diceBox.updateConfig({
      //   ...diceSettings,
      //   theme_customColorset: colorsets.fire,
      // });
    }

    if (!enemy) {
      toast.error("Enemy not found");
      return;
    }

    const result = await finishTurn(enemy.attack, enemy.id);
    if (!result) {
      return;
    }
    diceBox
      .roll(`1d6@${result}`)
      .then(() => {
        const fetchUpdatedEnemy = async () => {
          try {
            const updatedEnemy = await getEnemy();
            setEnemy(
              updatedEnemy
                ? {
                    ...updatedEnemy,
                    icon: updatedEnemy.icon ?? "/dungeons/slug.png",
                  }
                : null,
            );
          } catch (error) {
            console.error("Error fetching updated enemy:", error);
          }
        };
        fetchUpdatedEnemy();
      })
      .finally(() => {
        router.refresh();
        setThrown(false);
        setTurnFinished(true);
      });
  };

  // TODO: may be redundant, review later
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
              id: enemy.id,
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
      </div>
    </>
  );
}

export default Battleground;
