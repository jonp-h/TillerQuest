import { Typography, LinearProgress } from "@mui/material";
import Image from "next/image";
import React from "react";

function EnemyComponent({
  enemy,
  animateSpeed,
  selected,
}: {
  enemy: {
    name: string;
    id: string;
    guildName: string;
    icon: string;
    enemyId: number;
    attack: number;
    health: number;
    maxHealth: number;
  };
  animateSpeed: number;
  selected: boolean;
}) {
  return (
    <div
      className={
        enemy.health > 0
          ? "flex flex-col items-center justify-center pt-60 text-center cursor-pointer animate-move-up-down-" +
            animateSpeed
          : "flex flex-col items-center justify-center pt-60 text-center cursor-pointer mt-40"
      }
    >
      <div
        className={
          selected
            ? "border-2 border-red-600 w-full bg-black/40 p-3 rounded-xl shadow-lg backdrop-blur-sm"
            : "border-2 border-gray-600 w-full bg-black/40 p-3 rounded-xl shadow-lg backdrop-blur-sm"
        }
      >
        <Typography variant="h5" className="text-center">
          {enemy.name}
          <br />
          <p>
            {enemy.health <= 0 ? 0 : enemy.health} / {enemy.maxHealth} hp
          </p>
        </Typography>
        <LinearProgress
          color="health"
          variant="determinate"
          value={(enemy.health / enemy.maxHealth) * 100}
        />
        <Typography
          variant="subtitle2"
          color="textSecondary"
          sx={{ marginBottom: -1, marginTop: 0 }}
        >
          Attack: {enemy.attack}
        </Typography>
      </div>
      <Image
        src={enemy.health <= 0 ? "/dungeons/death.png" : enemy.icon}
        alt="Enemy"
        width={200}
        height={200}
        draggable={false}
        className=""
      />
    </div>
  );
}

export default EnemyComponent;
