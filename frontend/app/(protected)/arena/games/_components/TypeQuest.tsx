import {
  getRandomTypeQuestText,
  startGame,
  updateGame,
} from "@/data/games/game";
import { Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

function TypeQuest({
  gameEnabled,
  setGameEnabled,
  handleFinishGame,
  setScore,
  gameId,
}: {
  gameEnabled: boolean;
  setGameEnabled: (enabled: boolean) => void;
  handleFinishGame: () => void;
  setScore: (score: number) => void;
  gameId: string | null;
}) {
  const maxTime = 60;
  const [time, setTime] = useState(maxTime);
  const [isTyping, setIsTyping] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [WPM, setWPM] = useState(0);
  const [CPM, setCPM] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [mistakesIndex, setMistakesIndex] = useState<boolean[]>([]);
  const [characterClassName, setCharacterClassName] = useState<string[]>([]);
  const [currentParagraph, setCurrentParagraph] = useState<string>("");

  const correctClassName = " bg-green-700";
  const wrongClassName = " bg-red-700";
  const fixedClassName = " bg-yellow-600";

  useEffect(() => {
    inputRef.current?.focus();
    setCharacterClassName(Array(charRefs.current.length).fill(""));
    setMistakesIndex(Array(charRefs.current.length).fill(false));

    const handleFocus = () => {
      inputRef.current?.focus();
    };

    document.addEventListener("click", handleFocus);
    return () => {
      document.removeEventListener("click", handleFocus);
    };
  }, []);

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (isTyping && time > 0) {
      interval = setInterval(async () => {
        setTime((time) => time - 1);
        // Update game data every 2 seconds to reduce the number of requests
        if (time % 2 === 0) {
          const gamedata = await updateGame(
            gameId || "",
            [charIndex],
            mistakes,
          );
          if (typeof gamedata === "string") {
            toast.error(gamedata);
            return;
          }
          const { score, metadata } = gamedata || {};
          setWPM(metadata.wpm || 0);
          setCPM(metadata.cpm || 0);
          // the money reward given to the player upon completion of the game
          setScore(score);
        }
      }, 1000);
    } else if (time === 0) {
      clearInterval(interval);
      setIsTyping(false);
      setGameEnabled(false);
      handleFinishGame();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, time]);

  useEffect(() => {
    // Update charRefs array after currentParagraph is updated
    charRefs.current = Array(currentParagraph.length).fill(null);
    setCharacterClassName(Array(currentParagraph.length).fill(""));
    setMistakesIndex(Array(currentParagraph.length).fill(false));
  }, [currentParagraph]);

  const handleStartGame = async () => {
    if (!gameEnabled) {
      return;
    }
    await startGame(gameId || "");
    let newParagraph = currentParagraph;
    while (newParagraph === currentParagraph) {
      const text = await getRandomTypeQuestText();
      newParagraph = text?.text || "Error";
    }
    setCurrentParagraph(newParagraph);
    setIsTyping(true);
    setTime(maxTime);
    setMistakes(0);
    setCharIndex(0);
    charRefs.current = Array(currentParagraph.length).fill(null);
    setCharacterClassName(Array(currentParagraph.length).fill(""));
    setWPM(0);
    setCPM(0);
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const characters = charRefs.current;
    const currentChar = charRefs.current[charIndex];
    const typedChar = e.target.value.slice(-1);

    if ((e.nativeEvent as InputEvent).inputType === "deleteContentBackward") {
      if (charIndex > 0) {
        setCharIndex(charIndex - 1);
        if (characterClassName[charIndex - 1] === wrongClassName) {
          mistakesIndex[charIndex - 1] = true;
        }
        characterClassName[charIndex - 1] = "";
      }
      return;
    }

    if (!isTyping) {
      return;
    }
    if (charIndex < characters.length && time > 0) {
      if (typedChar === currentChar?.textContent) {
        setCharIndex(charIndex + 1);
        if (mistakesIndex[charIndex]) {
          characterClassName[charIndex] = fixedClassName;
        } else {
          characterClassName[charIndex] = correctClassName;
        }
      } else {
        setCharIndex(charIndex + 1);
        setMistakes(mistakes + 1);
        characterClassName[charIndex] = wrongClassName;
      }
      if (charIndex === characters.length - 1) {
        setIsTyping(false);
        setGameEnabled(false);
        handleFinishGame();
      }
    } else {
      setIsTyping(false);
      setGameEnabled(false);
      handleFinishGame();
    }
  };

  return (
    <div className=" w-1/2 m-2 p-3 rounded-xl border shadow-lg font-mono">
      <input
        type="text"
        className=" opacity-0 -z-50 absolute"
        ref={inputRef}
        onChange={handleChange}
      />
      <p className=" select-none cursor-text text-xl">
        {currentParagraph.split("").map((char, index) => (
          <span
            key={index}
            ref={(e) => {
              charRefs.current[index] = e;
            }}
            className={
              index === charIndex
                ? " border-b-2 border-green-500 "
                : characterClassName[index]
            }
          >
            {char}
          </span>
        ))}
      </p>
      <div className="flex justify-evenly border-t mt-4 pt-2">
        <p>
          Time left: <strong>{time}</strong>
        </p>
        <p>
          Mistakes: <strong>{mistakes}</strong>
        </p>
        <p>
          WPM: <strong>{WPM}</strong>
        </p>
        <p>
          CPM: <strong>{CPM}</strong>
        </p>
        {
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartGame}
            disabled={!gameEnabled || isTyping}
          >
            Start
          </Button>
        }
      </div>
    </div>
  );
}

export default TypeQuest;
