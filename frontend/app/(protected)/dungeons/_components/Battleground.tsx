"use client";
import React, { useEffect, useState } from "react";
import { diceSettings } from "@/lib/diceSettings";
import { toast } from "react-toastify";
import DiceBox from "@3d-dice/dice-box-threejs";
import EnemyComponent from "./EnemyComponent";
import { selectDungeonAbility } from "@/data/dungeons/dungeon";
import { AbilityGridProps, GuildEnemyWithEnemy } from "./interfaces";
import AbilityGrid from "./AbilityGrid";
import { Ability } from "@prisma/client";
import { useRouter } from "next/navigation";

function Battleground({
  abilities,
  userId,
  enemies,
  userTurns,
}: AbilityGridProps & {
  userId: string;
  enemies: GuildEnemyWithEnemy[];
  userTurns: { turns: number };
}) {
  const [diceBox, setDiceBox] = useState<DiceBox>();
  const [selectedEnemy, setSelectedEnemy] =
    useState<GuildEnemyWithEnemy | null>(enemies[0] || null);
  const [thrown, setThrown] = useState<boolean>(false);

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

  const rollAbility = async (ability: Ability) => {
    setThrown(true);
    if (!diceBox) {
      setThrown(false);
      initializeDiceBox();
      toast.info("Preparing dice..", { autoClose: 1000 });
      router.refresh();

      return;
    } else if (diceBox) {
      diceBox.clearDice();
    }
    const result = await selectDungeonAbility(
      userId,
      ability,
      selectedEnemy?.id || "",
    );

    // if result is only a string, it's an error message
    if (typeof result === "string") {
      toast.error(result);
      setThrown(false);
      router.refresh();
      return;
    } else if (!result.diceRoll) {
      setThrown(false);
      toast.error(result.message);
      router.refresh();
      return;
    }

    diceBox.roll(`${ability.diceNotation}@${result.diceRoll}`).finally(() => {
      setThrown(false);
      toast.success(result.message);
      router.refresh();
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
        {enemies &&
          enemies.map((enemy: GuildEnemyWithEnemy) => (
            <div onClick={() => setSelectedEnemy(enemy)} key={enemy.id}>
              <EnemyComponent
                selected={selectedEnemy === enemy}
                enemy={{
                  id: enemy.id,
                  enemyId: enemy.enemyId,
                  name: enemy.name,
                  guildName: enemy.guildName,
                  health: enemy.health,
                  icon: enemy.icon,
                  maxHealth: enemy.maxHealth,
                }}
              />
            </div>
          ))}
      </div>
      <div className="flex flex-col justify-center p-2">
        <div className="text-center text-white">
          You have {userTurns.turns} turns left
        </div>
        <AbilityGrid
          abilities={abilities}
          onAbilityRoll={rollAbility}
          disabled={
            thrown ||
            userTurns.turns <= 0 ||
            !!(selectedEnemy && selectedEnemy?.health <= 0)
          }
        />
      </div>
    </>
  );
}

export default Battleground;
