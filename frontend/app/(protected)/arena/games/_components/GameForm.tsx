"use client";
import { Button, Typography } from "@mui/material";
import { User } from "@prisma/client";
import { useState } from "react";
import { finishGame, initializeGame } from "@/data/games/game";
import { useRouter } from "next/navigation";
import TypeQuest from "./TypeQuest";
import { Circle, Stadium } from "@mui/icons-material";
import { toast } from "react-toastify";

function GameForm({ user }: { user: User }) {
  const [gameVisible, setGameVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [gameEnabled, setGameEnabled] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const router = useRouter();

  const handleInitializeGame = async () => {
    const gameId = await initializeGame(user.id, "TypeQuest");
    if (gameId) {
      setGameVisible(true);
      setGameEnabled(true);
      setScore(0);
      setGameId(gameId);
    } else {
      toast.error("Not enough tokens");
    }
  };

  const handleFinishGame = async () => {
    if (gameEnabled === true && gameId) {
      const game = await finishGame(gameId || "");
      // if game is a string, it's an error message
      if (typeof game === "string") {
        toast.error(game);
      } else {
        toast.success(game.message);
        setScore(game.gold);
      }
      setGameId(null);
    }
    setGameEnabled(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col mt-5 text-center justify-center">
      <h1 className="text-4xl font-bold">TypeQuest</h1>
      <Typography variant="subtitle1" color="success">
        Type the text as fast as you can
      </Typography>
      <div className="my-5">
        <Typography variant="body1">
          You earn gold <Circle htmlColor="gold" /> depending on your typing
          speed (measured in characters per minute, or CPM) and the number of
          mistakes you make!
        </Typography>
        <Typography variant="body1">
          Try your mettle in the arena and see how fast you can type! ...And who
          knows, you might even learn something!
        </Typography>
      </div>
      {!gameEnabled && (
        <Typography variant="h6" color="info" className="pb-4">
          You have {user.arenaTokens} <Stadium className="mx-1" />
        </Typography>
      )}
      <div>
        {!gameEnabled && (
          <Button
            variant="contained"
            size="large"
            disabled={user.arenaTokens < 1 || gameEnabled}
            onClick={handleInitializeGame}
          >
            Buy one round (1 <Stadium className="mx-1" />)
          </Button>
        )}
      </div>

      <div className="flex flex-col justify-center items-center">
        {gameVisible && (
          <TypeQuest
            gameEnabled={gameEnabled}
            setGameEnabled={setGameEnabled}
            handleFinishGame={handleFinishGame}
            setScore={setScore}
            gameId={gameId}
          />
        )}
        <div className="mt-5">
          <Typography variant="h6" color="info">
            {score > 0 && `You earned ${score} gold coins`}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default GameForm;
