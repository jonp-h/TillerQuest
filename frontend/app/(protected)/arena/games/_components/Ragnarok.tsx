"use client";
import { Circle } from "@mui/icons-material";
import { Button } from "@mui/material";
import clsx from "clsx";
import { useEffect, useState } from "react";

const width = 8;
const runes = [
  "/ragnarok/redrune.png",
  "/ragnarok/shield.png",
  "/ragnarok/greenrune.png",
  "/ragnarok/hammer.png",
  "/ragnarok/coin.png",
  "/ragnarok/mjolnir.png",
];

export default function Ragnarok({
  score,
  setScore,
  maxMoves,
  setMaxMoves,
}: {
  score: number;
  setScore: (score: number) => void;
  maxMoves: number;
  setMaxMoves: (maxMoves: number) => void;
}) {
  const [currentRuneArrangement, setCurrentRuneArrangement] = useState<
    string[]
  >([]);
  const [squareBeingDragged, setSquareBeingDragged] = useState(Object);
  const [squareBeingReplaced, setSquareBeingReplaced] = useState(Object);

  const checkForColumnOfFive = () => {
    // only need to check until the 5th bottom row
    for (let i = 0; i <= 31; i++) {
      // the indexes in columnOfFour are the indexes of the rows below
      const columnOfFive = [
        i,
        i + width,
        i + width * 2,
        i + width * 3,
        i + width * 4,
      ];
      const decidedRune = currentRuneArrangement[i];
      const isBlank = currentRuneArrangement[i] === "/ragnarok/blank.png";
      if (
        columnOfFive.every(
          (index) => currentRuneArrangement[index] === decidedRune && !isBlank,
        )
      ) {
        columnOfFive.forEach(
          // replaces the indexes of the runes with an empty string
          (index) => (currentRuneArrangement[index] = "/ragnarok/blank.png"),
        );
        console.log("column of five");
        setScore(score + 12);
        setMaxMoves(maxMoves + 1);
        return true;
      }
    }
  };

  const checkForRowOfFive = () => {
    for (let i = 0; i < 64; i++) {
      // the indexes in rowOfFive are the indexes to the right
      const rowOfFive = [i, i + 1, i + 2, i + 3, i + 4];
      const decidedRune = currentRuneArrangement[i];
      const isBlank = currentRuneArrangement[i] === "/ragnarok/blank.png";
      const notValid = [
        4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23, 28, 29, 30, 31, 36, 37, 38,
        39, 44, 45, 46, 47, 52, 53, 54, 55, 61, 62, 63, 64,
      ];

      if (notValid.includes(i)) continue;

      if (
        rowOfFive.every(
          (index) => currentRuneArrangement[index] === decidedRune && !isBlank,
        )
      ) {
        rowOfFive.forEach(
          (index) => (currentRuneArrangement[index] = "/ragnarok/blank.png"),
        );
        console.log("row of five");
        setScore(score + 12);
        setMaxMoves(maxMoves + 1);
        return true;
      }
    }
  };

  const checkForColumnOfFour = () => {
    // only need to check until the 4th bottom row
    for (let i = 0; i <= 39; i++) {
      // the indexes in columnOfFour are the indexes of the rows below
      const columnOfFour = [i, i + width, i + width * 2, i + width * 3];
      const decidedRune = currentRuneArrangement[i];
      const isBlank = currentRuneArrangement[i] === "/ragnarok/blank.png";
      if (
        columnOfFour.every(
          (index) => currentRuneArrangement[index] === decidedRune && !isBlank,
        )
      ) {
        columnOfFour.forEach(
          // replaces the indexes of the runes with an empty string
          (index) => (currentRuneArrangement[index] = "/ragnarok/blank.png"),
        );
        setScore(score + 6);
        return true;
      }
    }
  };

  const checkForRowOfFour = () => {
    for (let i = 0; i < 64; i++) {
      // the indexes in rowOfFour are the indexes to the right
      const rowOfFour = [i, i + 1, i + 2, i + 3];
      const decidedRune = currentRuneArrangement[i];
      const isBlank = currentRuneArrangement[i] === "/ragnarok/blank.png";
      const notValid = [
        5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53,
        54, 55, 62, 63, 64,
      ];

      if (notValid.includes(i)) continue;

      if (
        rowOfFour.every(
          (index) => currentRuneArrangement[index] === decidedRune && !isBlank,
        )
      ) {
        rowOfFour.forEach(
          (index) => (currentRuneArrangement[index] = "/ragnarok/blank.png"),
        );
        setScore(score + 6);
        return true;
      }
    }
  };

  const checkForColumnOfThree = () => {
    // only need to check until the 3th bottom row
    for (let i = 0; i <= 47; i++) {
      // the indexes in columnOfThree are the indexes of the rows below
      const columnOfThree = [i, i + width, i + width * 2];
      const decidedRune = currentRuneArrangement[i];
      const isBlank = currentRuneArrangement[i] === "/ragnarok/blank.png";
      if (
        columnOfThree.every(
          (index) => currentRuneArrangement[index] === decidedRune && !isBlank,
        )
      ) {
        columnOfThree.forEach(
          // replaces the indexes of the runes with an empty string
          (index) => (currentRuneArrangement[index] = "/ragnarok/blank.png"),
        );
        setScore(score + 3);
        return true;
      }
    }
  };

  const checkForRowOfThree = () => {
    // only need to check until the 3rd bottom row
    for (let i = 0; i < 64; i++) {
      // the indexes in rowOfThree are the indexes to the right
      const rowOfThree = [i, i + 1, i + 2];
      const decidedRune = currentRuneArrangement[i];
      const isBlank = currentRuneArrangement[i] === "/ragnarok/blank.png";
      const notValid = [
        6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 63, 64,
      ];

      if (notValid.includes(i)) continue;

      if (
        rowOfThree.every(
          (index) => currentRuneArrangement[index] === decidedRune && !isBlank,
        )
      ) {
        rowOfThree.forEach(
          (index) => (currentRuneArrangement[index] = "/ragnarok/blank.png"),
        );
        setScore(score + 3);
        return true;
      }
    }
  };

  const moveIntoSquareBelow = () => {
    for (let i = 0; i <= 55; i++) {
      const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
      const isFirstRow = firstRow.includes(i);

      if (isFirstRow && currentRuneArrangement[i] === "/ragnarok/blank.png") {
        let randomNumber = Math.floor(Math.random() * runes.length);
        currentRuneArrangement[i] = runes[randomNumber];
      }

      if (currentRuneArrangement[i + width] === "/ragnarok/blank.png") {
        currentRuneArrangement[i + width] = currentRuneArrangement[i];
        currentRuneArrangement[i] = "/ragnarok/blank.png";
      }
    }
  };

  // e is the event
  const dragStart = (e: React.DragEvent<HTMLImageElement>) => {
    setSquareBeingDragged(e.target);
  };
  const dragDrop = (e: React.DragEvent<HTMLImageElement>) => {
    setSquareBeingReplaced(e.target);
  };
  const dragEnd = () => {
    console.log("drag end");

    const squareBeingDraggedId = parseInt(
      squareBeingDragged.getAttribute("data-id"),
    );
    const squareBeingReplacedId = parseInt(
      squareBeingReplaced.getAttribute("data-id"),
    );

    const validMoves = [
      squareBeingDraggedId - 1,
      squareBeingDraggedId - width,
      squareBeingDraggedId + 1,
      squareBeingDraggedId + width,
    ];
    const validMove = validMoves.includes(squareBeingReplacedId);

    // Make a move only if there are moves left and it is a valid move
    if (validMove == true && maxMoves > 0) {
      currentRuneArrangement[squareBeingReplacedId] =
        squareBeingDragged.getAttribute("src");
      currentRuneArrangement[squareBeingDraggedId] =
        squareBeingReplaced.getAttribute("src");
      setMaxMoves(maxMoves - 1);
    }
    const isAColumnOfFive = checkForColumnOfFive();
    const isARowOfFive = checkForRowOfFive();
    const isAColumnOfFour = checkForColumnOfFour();
    const isARowOfFour = checkForRowOfFour();
    const isAColumnOfThree = checkForColumnOfThree();
    const isARowOfThree = checkForRowOfThree();

    if (
      validMove &&
      (isARowOfThree ||
        isARowOfFour ||
        isARowOfFive ||
        isAColumnOfFive ||
        isAColumnOfFour ||
        isAColumnOfThree)
    ) {
      console.log(
        "valid move",
        validMove,
        isARowOfThree || isARowOfFour || isAColumnOfFour || isAColumnOfThree,
      );
      setSquareBeingDragged(null);
      setSquareBeingReplaced(null);
    } else {
      currentRuneArrangement[squareBeingReplacedId] =
        squareBeingReplaced.getAttribute("src");
      currentRuneArrangement[squareBeingDraggedId] =
        squareBeingDragged.getAttribute("src");
      setCurrentRuneArrangement([...currentRuneArrangement]);
    }
  };

  const createBoard = () => {
    const randomRuneArrangement = [];
    for (let i = 0; i < width * width; i++) {
      // Pickes random rune from 0 to 5
      const randomRune = runes[Math.floor(Math.random() * runes.length)];
      randomRuneArrangement.push(randomRune);
    }
    setCurrentRuneArrangement(randomRuneArrangement);
  };

  // useEffect is a side effect that runs after the component is rendered
  // the [] is a dependency array that tells the useEffect to only run once
  useEffect(() => {
    createBoard();
  }, []);

  useEffect(() => {
    // checks for matches every 100ms
    const timer = setInterval(() => {
      checkForColumnOfFive();
      checkForColumnOfFour();
      checkForColumnOfThree();
      checkForRowOfFive();
      checkForRowOfFour();
      checkForRowOfThree();
      moveIntoSquareBelow();
      // after checking for matches, set the state to the new arrangement
      setCurrentRuneArrangement([...currentRuneArrangement]);
    }, 100);
    return () => clearInterval(timer);
  }, [
    checkForColumnOfFive,
    checkForColumnOfFour,
    checkForColumnOfThree,
    checkForRowOfFive,
    checkForRowOfFour,
    checkForRowOfThree,
    moveIntoSquareBelow,
    currentRuneArrangement,
  ]);

  return (
    //Main container with gradient background
    <div className="flex flex-col md:flex-row">
      <div
        className={clsx(
          "grid grid-cols-8 justify-center md:p-10",
          maxMoves == 0 && "hidden",
        )}
        style={{ width: "560px" }}
      >
        {currentRuneArrangement.map((rune: string, index: number) => (
          <img
            className="w-14"
            key={index}
            // style={{ backgroundColor: rune }}
            alt=""
            src={rune}
            data-id={index}
            draggable="true"
            onDragStart={dragStart}
            // stop browser from refreshing when dragging image
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            onDrop={dragDrop}
            onDragEnd={dragEnd}
          />
        ))}
      </div>
      <div className="">
        <h1 className=" text-6xl p-10">RAGNAROK</h1>
        {maxMoves !== 0 && (
          <h1 className="font-semibold text-xl text-orange-600">
            Moves left: {maxMoves}
          </h1>
        )}
        {maxMoves !== 0 && (
          <h1 className="p-5 font-semibold text-5xl text-yellow-400">
            Score: {score}
          </h1>
        )}
        {maxMoves === 0 && (
          <h1 className="font-semibold text-6xl text-orange-600">Game over</h1>
        )}
        {maxMoves === 0 && (
          <h1 className="p-5 font-semibold text-3xl text-yellow-400">
            You gained {score} <Circle fontSize="inherit" />
          </h1>
        )}
        <p className=" flex flex-col py-6 gap-3">
          <strong>3 matches:</strong> 3 points
          <br /> <strong>4 matches:</strong> 9 points <br />{" "}
          <strong>5 matches:</strong> 12 points + 1 extra move
        </p>
      </div>
    </div>
  );
}
