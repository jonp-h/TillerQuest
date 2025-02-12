"use client";
import { Button, Typography } from "@mui/material";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import Ragnarok from "./Ragnarok";
import { finishGame, startGame } from "@/data/games/game";

function GameForm({ user }: { user: User }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [maxMoves, setMaxMoves] = useState(6);
  const [feedback, setFeedback] = useState("");

  // Effect to finish game when maxMoves reaches zero
  useEffect(() => {
    if (maxMoves === 0) {
      handleFinishGame();
    }
  }, [maxMoves]);

  const handleStartGame = async () => {
    if (await startGame(user)) {
      setGameStarted(true);
      setFeedback("");
    } else {
      setFeedback("Not enough tokens");
    }
  };

  const handleFinishGame = async () => {
    setTimeout(async () => {
      setFeedback(await finishGame(user.id, score));
      setScore(0);
      setMaxMoves(6);
      setGameStarted(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col mt-5 text-center justify-center">
      <div>
        {!gameStarted && (
          <Button
            variant="contained"
            size="large"
            disabled={user.arenaTokens < 1}
            onClick={handleStartGame}
          >
            Start Ragnarok game (1 Arenatoken)
          </Button>
        )}
        {feedback && (
          <Typography variant="h6" color="info">
            {feedback}
          </Typography>
        )}
      </div>
      <div className="flex justify-center items-center">
        {gameStarted && (
          <Ragnarok
            score={score}
            setScore={setScore}
            maxMoves={maxMoves}
            setMaxMoves={setMaxMoves}
          />
        )}
      </div>
    </div>
  );
}

export default GameForm;
