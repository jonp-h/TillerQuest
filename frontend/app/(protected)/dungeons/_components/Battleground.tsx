"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { diceSettings } from "@/lib/diceSettings";
import { toast } from "react-toastify";
import DiceBox from "@3d-dice/dice-box-threejs";
import EnemyComponent from "./EnemyComponent";
import { finishTurn, getEnemy, isTurnFinished } from "@/data/dungeons/dungeon";
import { useRouter } from "next/navigation";
import { GuildEnemyWithEnemy } from "./interfaces";

function Battleground() {
  const [enemy, setEnemy] = useState<GuildEnemyWithEnemy | null>(null);
  const [diceBox, setDiceBox] = useState<DiceBox>();
  const [thrown, setThrown] = useState<boolean>(false);
  const [turnFinished, setTurnFinished] = useState(false);
  const [bossDead, setBossDead] = useState<boolean>(false);
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
        if (!enemy) {
          return;
        }
        if (enemy.health <= 0) {
          setBossDead(true);
          setEnemy({
            ...enemy,
            icon: enemy.enemy.icon,
            maxHealth: enemy.enemy.maxHealth,
          });
        }
        setEnemy({
          ...enemy,
          icon: enemy.enemy.icon,
          maxHealth: enemy.enemy.maxHealth,
        });

        setBossDead(false);
      } catch (error) {
        console.error("Error fetching enemy:", error);
      }
    };

    fetchEnemy(); // Fetch the enemy on component mount
  }, []);

  const rollDice = async () => {
    setThrown(true);
    if (!diceBox) {
      initializeDiceBox();
      console.log("Dicebox was null", diceBox);
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

    if (!enemy) {
      toast.error("Enemy not found");
      return;
    }

    const result = await finishTurn("1d6");
    if (!result) {
      return;
    }
    diceBox
      .roll(`1d6@${result}`)
      .then(() => {
        const fetchUpdatedEnemy = async () => {
          try {
            const updatedEnemy = await getEnemy();
            if (!updatedEnemy) {
              return;
            }
            setEnemy({
              ...updatedEnemy,
              icon: enemy.icon,
              maxHealth: enemy.maxHealth,
            });
          } catch (error) {
            console.error("Error fetching updated enemy:", error);
          }
        };
        fetchUpdatedEnemy();
      })
      .finally(() => {
        setThrown(false);
        setTurnFinished(true);
        router.refresh();
      });
  };

  // TODO: may be redundant, review later
  useEffect(() => {
    const fetchTurnStatus = async () => {
      const status = await isTurnFinished();
      if (status?.turns == null) {
        return;
      }
      setTurnFinished(status.turns > 0);
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
          <EnemyComponent
            enemy={{
              name: enemy.name,
              health: enemy.health,
              guildName: enemy.guildName,
              enemyId: enemy.enemyId,
              icon: enemy.icon,
              maxHealth: enemy.maxHealth,
            }}
          />
        )}
      </div>
      <div className="flex justify-center p-2">
        <Button
          onClick={rollDice}
          variant="contained"
          color="primary"
          disabled={Boolean(turnFinished) || thrown || bossDead}
        >
          Roll Dice
        </Button>
      </div>
    </>
  );
}

export default Battleground;
