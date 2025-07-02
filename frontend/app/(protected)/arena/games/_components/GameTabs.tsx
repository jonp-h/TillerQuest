"use client";

import { Box, Tabs, Tab, Typography } from "@mui/material";
import { ReactNode, useState } from "react";
import TypeQuest from "./TypeQuest";
import { useRouter } from "next/navigation";
import { finishGame, initializeGame } from "@/data/games/game";
import { toast } from "react-toastify";
import { Circle, Stadium } from "@mui/icons-material";
import { User } from "@prisma/client";
import DialogButton from "@/components/DialogButton";

interface TabPanelProps {
  children?: ReactNode;
  value: string;
  tab: string;
}

function GameTabPanel(props: TabPanelProps) {
  const { children, value, tab, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== tab}
      id={`game-tabpanel-${tab}`}
      aria-labelledby={`game-tab-${tab}`}
      {...other}
    >
      {value === tab && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(gameName: string) {
  return {
    id: `game-tab-${gameName}`,
    "aria-controls": `game-tabpanel-${gameName}`,
  };
}

function GameTabs({ user }: { user: User }) {
  const [tab, setTab] = useState<string>("TypeQuest");
  const [gameVisible, setGameVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [gameEnabled, setGameEnabled] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const router = useRouter();

  const handleInitializeGame = async (gameName: string) => {
    const game = await initializeGame(user.id, gameName);
    if (typeof game === "string") {
      toast.error(game);
      return;
    }
    if (game) {
      setGameVisible(true);
      setGameEnabled(true);
      setScore(0);
      setGameId(game.id);
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

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          centered
          value={tab}
          onChange={handleChange}
          aria-label="Game tabs"
        >
          <Tab
            disabled={gameEnabled}
            label="TypeQuest"
            {...a11yProps("TypeQuest")}
            value={"TypeQuest"}
          />
          <Tab
            disabled={true}
            label="Dice Corner"
            {...a11yProps("Dice Corner")}
            value="Dice Corner"
          />
        </Tabs>
      </Box>
      <GameTabPanel tab={tab} value={"TypeQuest"}>
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold">TypeQuest</h1>
          <Typography variant="subtitle1" color="success">
            Type the text as fast as you can
          </Typography>
          <div className="my-5">
            <Typography variant="body1">
              You earn gold <Circle htmlColor="gold" /> depending on your typing
              speed (measured in words per minute, or WPM) and the number of
              mistakes you make!
            </Typography>
            <Typography variant="body1">
              Try your mettle in the arena and see how fast you can type! ...And
              who knows, you might even learn something!
            </Typography>
          </div>

          {gameVisible && (
            <TypeQuest
              gameEnabled={gameEnabled}
              setGameEnabled={setGameEnabled}
              handleFinishGame={handleFinishGame}
              setScore={setScore}
              gameId={gameId}
            />
          )}
        </div>
      </GameTabPanel>
      <GameTabPanel tab={tab} value={"Dice Corner"}>
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold">Dice Corner</h1>
        </div>
      </GameTabPanel>
      <div className="text-center mt-5 gap-5">
        {!gameEnabled && (
          <>
            <Typography variant="h6" color="info" className="pb-4">
              You have {user.arenaTokens} <Stadium className="mx-1" />
            </Typography>
            <DialogButton
              buttonText={
                <Typography>
                  Buy one round (1 <Stadium className="mx-1" />)
                </Typography>
              }
              dialogTitle={tab}
              dialogContent={
                <Typography>
                  Are you sure you want to spend 1 <Stadium className="mx-1" />{" "}
                  to buy a round of {tab}? The token is lost if you leave the
                  page.
                </Typography>
              }
              agreeText="Buy one round"
              disagreeText="Cancel"
              buttonVariant="contained"
              disabled={user.arenaTokens < 1 || gameEnabled}
              dialogFunction={() => handleInitializeGame(tab)}
            />
          </>
        )}
        <Typography variant="h6" color="info">
          {score > 0 && `You earned ${score} gold coins`}
        </Typography>
      </div>
    </>
  );
}

export default GameTabs;
