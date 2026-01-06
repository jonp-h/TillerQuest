"use client";
import { useEffect, useState } from "react";
import { diceSettings } from "@/lib/diceSettings";
import { toast } from "react-toastify";
import DiceBox from "@3d-dice/dice-box-threejs";
import EnemyComponent from "./EnemyComponent";
import { AbilityGridProps } from "./interfaces";
import AbilityGrid from "./AbilityGrid";
import { Ability, GuildEnemy } from "@tillerquest/prisma/browser";
import { useRouter } from "next/navigation";
import TimeLeft from "@/components/TimeLeft";
import { Button, Typography } from "@mui/material";
import Link from "next/link";
import { AbilityResponse } from "@/types/apiResponse";
import { securePostClient } from "@/lib/secureFetchClient";

function Battleground({
  abilities,
  enemies,
  userTurns,
}: AbilityGridProps & {
  abilities: Ability[];
  userId: string;
  enemies: GuildEnemy[];
  userTurns: number;
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
      result = await securePostClient<AbilityResponse>(`/abilities/use`, {
        abilityName: ability.name,
        targetIds: enemyIds,
      });
    } else {
      result = await securePostClient<AbilityResponse>(`/abilities/use`, {
        abilityName: ability.name,
        targetIds: selectedEnemies,
      });
    }

    if (result.ok) {
      diceBox
        .roll(`${ability.diceNotation}@${result.data.diceRoll}`)
        .finally(() => {
          toast.success(result.data.message);
          router.refresh();
        });
    } else {
      toast.error(result.error);
      router.refresh();
    }
    setThrown(false);
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
              <Typography>
                All enemies are slain. The dungeons are safe for now.
              </Typography>
              <Link href="/guild">
                <Button variant="text">Vote to venture further</Button>
              </Link>
            </div>
          ) : (
            <div className="absolute flex gap-1 bg-black/20 p-2 rounded-xl backdrop-blur-sm animate-pulse">
              <Typography>Enemies attack in </Typography>
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
            <Typography>
              You see faint shadows moving in the dark. Ask your guild leader to
              venture further.
            </Typography>
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
            userTurns ? (
              <div>
                <Typography>You have {userTurns} turns left</Typography>
                <AbilityGrid
                  abilities={abilities}
                  onAbilityRoll={rollAbility}
                  disabled={
                    thrown ||
                    userTurns <= 0 ||
                    !selectedEnemies.length ||
                    !enemies
                    // TODO: add a check for if the target is dead
                  }
                />
              </div>
            ) : (
              <div className="flex text-center justify-center gap-1">
                <Typography>You must rest for</Typography>
                <TimeLeft
                  color="error"
                  endTime={new Date(new Date().setHours(24, 0, 0, 0))}
                />
                <Typography>
                  before you can muster your strength enough to fight in the
                  dungeons again
                </Typography>
              </div>
            )
          ) : (
            <Typography>
              Buy dungeon abilities to fight in the dungeons
            </Typography>
          )}
        </div>
      </div>
    </>
  );
}

export default Battleground;
