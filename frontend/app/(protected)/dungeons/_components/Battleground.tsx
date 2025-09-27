"use client";
import React, { useEffect, useState } from "react";
import { diceSettings } from "@/lib/diceSettings";
import { toast } from "react-toastify";
import DiceBox from "@3d-dice/dice-box-threejs";
import EnemyComponent from "./EnemyComponent";
import { AbilityGridProps } from "./interfaces";
import AbilityGrid from "./AbilityGrid";
import { Ability } from "@prisma/client";
import { useRouter } from "next/navigation";
import TimeLeft from "@/components/TimeLeft";
import { Button } from "@mui/material";
import Link from "next/link";
import { selectAbility } from "@/data/abilities/abilityUsage/useAbility";

function Battleground({
  abilities,
  userId,
  enemies,
  userTurns,
}: AbilityGridProps & {
  userId: string;
  enemies:
    | {
        name: string;
        id: string;
        guildName: string;
        icon: string;
        enemyId: number;
        attack: number;
        health: number;
        maxHealth: number;
      }[]
    | null;
  userTurns: { turns: number };
}) {
  const [diceBox, setDiceBox] = useState<DiceBox>();
  const [selectedEnemies, setSelectedEnemies] = useState<string[]>([]);
  const [thrown, setThrown] = useState<boolean>(false);

  const enemyIds = enemies?.map((enemy) => enemy.id) || [];

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
    let result;
    if (ability.target === "All") {
      // update the UI to show the selected enemies visually
      setSelectedEnemies(enemyIds);
      result = await selectAbility(userId, enemyIds, ability.name);
    } else {
      result = await selectAbility(userId, selectedEnemies, ability.name);
    }

    if (result.success) {
      diceBox
        .roll(`${ability.diceNotation}@${result.data.diceRoll}`)
        .finally(() => {
          toast.success(result.data.message);
          setThrown(false);
          router.refresh();
        });
    } else {
      toast.error(result.error);
      setThrown(false);
      router.refresh();
    }
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
        {enemies && enemies.length > 0 ? (
          enemies.every((enemy) => enemy.health <= 0) ? (
            <div className="absolute z-10 flex flex-col text-center gap-1 bg-black/20 p-2 rounded-xl backdrop-blur-sm">
              <p>All enemies are slain. The dungeons are safe for now.</p>
              <Link href="/guild">
                <Button variant="text">Vote to venture further</Button>
              </Link>
            </div>
          ) : (
            <div className="absolute flex gap-1 bg-black/20 p-2 rounded-xl backdrop-blur-sm animate-pulse">
              <p>Enemies attack in </p>
              <div className="text-red-500">
                <TimeLeft
                  endTime={
                    new Date(
                      new Date().setHours(16, 0, 0, 0) +
                        (new Date() > new Date(new Date().setHours(16, 0, 0, 0))
                          ? 24 * 60 * 60 * 1000
                          : 0),
                    )
                  }
                />
              </div>
            </div>
          )
        ) : (
          <div className="absolute z-10 flex gap-1 bg-black/20 p-2 rounded-xl backdrop-blur-sm">
            <p>
              You see faint shadows moving in the dark. Ask your guild leader to
              venture further.
            </p>
          </div>
        )}
        {enemies &&
          enemies.map((enemy, index: number) => (
            <div onClick={() => setSelectedEnemies([enemy.id])} key={enemy.id}>
              <EnemyComponent
                selected={selectedEnemies.includes(enemy.id)}
                animateSpeed={index % 4} // get a number between 0 and 3 to animate the enemies
                enemy={enemy}
              />
            </div>
          ))}
      </div>
      <div className="flex flex-col justify-center p-2">
        <div className="text-center text-white">
          {abilities.some((ability) => ability.isDungeon) ? (
            userTurns.turns ? (
              <div>
                <p>You have {userTurns.turns} turns left</p>
                <AbilityGrid
                  abilities={abilities}
                  onAbilityRoll={rollAbility}
                  disabled={
                    thrown ||
                    userTurns.turns <= 0 ||
                    !selectedEnemies.length ||
                    !enemies
                    // TODO: add a check for if the target is dead
                  }
                />
              </div>
            ) : (
              <div className="flex text-center justify-center gap-1">
                <p>You must rest for </p>

                <div className="text-red-500 text-5xl">
                  <TimeLeft
                    endTime={new Date(new Date().setHours(24, 0, 0, 0))}
                  />
                </div>
                <p>
                  before you can muster your strength enough to fight in the
                  dungeons again
                </p>
              </div>
            )
          ) : (
            <p>Buy dungeon abilities to fight in the dungeons</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Battleground;
