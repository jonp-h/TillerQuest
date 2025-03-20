"use client";
import { Button, Typography } from "@mui/material";
import { User } from "@prisma/client";
import { useCallback, useState } from "react";
import { finishGame, startGame } from "@/data/games/game";
import { useRouter } from "next/navigation";
import TypeQuest from "./TypeQuest";
import { Circle, Stadium } from "@mui/icons-material";
import { toast } from "react-toastify";
import { createHmac } from "@/lib/hmac";

function GameForm({ user }: { user: User }) {
  const [gameVisible, setGameVisible] = useState(false);
  const [moneyReward, setMoneyReward] = useState(0);
  const [gameEnabled, setGameEnabled] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const router = useRouter();

  const handleStartGame = async () => {
    const gameId = await startGame(user.id, "TypeQuest");
    if (gameId) {
      setGameVisible(true);
      setGameEnabled(true);
      setMoneyReward(0);
      setGameId(gameId);
    } else {
      toast.error("Not enough tokens");
    }
  };

  // const memoizedUpdateGameState = useCallback(async (score: number) => {
  //   if (gameId) {
  //     createHmac(gameId, score);
  //     await updateGame(gameId, score);
  //     setMoneyReward(score);
  //   }
  // }, []);

  const handleFinishGame = async () => {
    if (gameEnabled === true && gameId) {
      const hmac = createHmac(gameId, moneyReward);
      toast.success(await finishGame(gameId || "", moneyReward, hmac));
      setGameId(null);
    }
    setGameEnabled(false);
    router.refresh();
  };

  const memoizedSetMoneyReward = useCallback((reward: number) => {
    setMoneyReward(reward);
  }, []);

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
            onClick={handleStartGame}
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
            setMoneyReward={memoizedSetMoneyReward}
          />
        )}
        <div className="mt-5">
          <Typography variant="h6" color="info">
            {moneyReward > 0 && `You earned ${moneyReward} gold coins`}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default GameForm;
