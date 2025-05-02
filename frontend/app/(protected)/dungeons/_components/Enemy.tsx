import { Typography, LinearProgress } from "@mui/material";
import Image from "next/image";
import React from "react";
import { EnemyProps } from "@/types/types";

function Enemy({ enemy }: { enemy: EnemyProps }) {
  return (
    <div
      className={
        "flex flex-col items-center justify-center pt-60 text-center cursor-pointer animate-move-up-down-"
      }
    >
      <div
        className={
          "border-2 border-red-600 w-full bg-black/40 p-3 rounded-xl shadow-lg backdrop-blur-sm"
        }
      >
        <Typography variant="h5" className="text-center">
          {enemy.name}
        </Typography>
        <LinearProgress
          color="health"
          variant="determinate"
          value={(enemy.health / enemy.maxHealth) * 100}
        />
      </div>
      <Image
        src={enemy.icon}
        alt="Enemy"
        width={200}
        height={200}
        draggable={false}
        className=""
      />
    </div>
  );
}

export default Enemy;
