import { getRandomTypeQuestText } from "@/data/games/game";
import { Button } from "@mui/material";
import React, { useEffect, useRef } from "react";

function TypeQuest({
  gameEnabled,
  setGameEnabled,
  handleFinishGame,
  setMoneyReward,
}: {
  gameEnabled: boolean;
  setGameEnabled: (enabled: boolean) => void;
  handleFinishGame: () => void;
  setMoneyReward: (reward: number) => void;
}) {
  const maxTime = 60;
  const [time, setTime] = React.useState(maxTime);
  const [isTyping, setIsTyping] = React.useState(false);
  const [mistakes, setMistakes] = React.useState(0);
  const [WPM, setWPM] = React.useState(0);
  const [CPM, setCPM] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [characterClassName, setCharacterClassName] = React.useState<string[]>(
    [],
  );
  const [currentParagraph, setCurrentParagraph] = React.useState<string>("");

  useEffect(() => {
    inputRef.current?.focus();
    setCharacterClassName(Array(charRefs.current.length).fill(""));

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
      interval = setInterval(() => {
        setTime((time) => time - 1);
        const correctChars = charIndex - mistakes;
        const totalTime = maxTime - time;

        // words per minute. Mathmatical standard is 5 characters per word
        let wpm = Math.round((correctChars / 5 / totalTime) * 60);
        wpm = wpm < 0 || !wpm || wpm == Infinity ? 0 : wpm;
        setWPM(Math.floor(wpm));

        // characters per minute
        let cpm = correctChars * (60 / totalTime);
        cpm = cpm < 0 || !cpm || cpm == Infinity ? 0 : cpm;
        setCPM(Math.floor(cpm));
      }, 1000);

      // the money reward given to the player upon completion of the game
      setMoneyReward(
        Math.floor(((CPM * (charIndex - mistakes)) / (mistakes + 1)) * 0.1) + 1,
      );
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
  }, [currentParagraph]);

  const startGame = async () => {
    if (!gameEnabled) {
      return;
    }
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
    if (!isTyping) {
      return;
    }
    if (charIndex < characters.length && time > 0) {
      if (typedChar === currentChar?.textContent) {
        setCharIndex(charIndex + 1);
        characterClassName[charIndex] = " bg-green-700";
      } else {
        setCharIndex(charIndex + 1);
        setMistakes(mistakes + 1);
        characterClassName[charIndex] = " bg-red-700";
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
            onClick={startGame}
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
