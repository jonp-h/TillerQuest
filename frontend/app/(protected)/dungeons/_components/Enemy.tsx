import { Typography, LinearProgress } from "@mui/material";
import Image from "next/image";
import React from "react";

function Enemy({
  enemy,
  selectedEnemy,
  setSelectedEnemy,
}: {
  enemy: { index: number; name: string; health: number };
  selectedEnemy: number;
  setSelectedEnemy: (enemy: number) => void;
}) {
  return (
    <div
      className={
        "flex flex-col items-center justify-center pt-60 text-center cursor-pointer animate-move-up-down-" +
        enemy.index
      }
      onClick={() => setSelectedEnemy(enemy.index)}
    >
      <div
        className={
          selectedEnemy === enemy.index
            ? "border-2 border-red-600 w-full bg-black/40 p-3 rounded-xl shadow-lg backdrop-blur-sm"
            : "border-2 w-full bg-black/40 p-3 rounded-xl shadow-lg backdrop-blur-sm"
        }
      >
        <Typography variant="h5" className="text-center">
          Slug
        </Typography>
        <LinearProgress
          color="health"
          variant="determinate"
          value={(enemy.health / 100) * 100}
        />
      </div>
      <Image
        src="/dungeons/slug.png"
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
