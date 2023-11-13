"use client";
import { useEffect, useState } from "react";
import axe from "../../public/ragnarok/axe.png";
import bow from "../../public/ragnarok/bow.png";
import shield from "../../public/ragnarok/shield.png";
import spear from "../../public/ragnarok/spear.png";
import sword from "../../public/ragnarok/sword.png";
import viking from "../../public/ragnarok/viking.png";
import blank from "../../public/ragnarok/blank.png";
import { StaticImageData } from "next/image";

const width = 8;
const runes = [sword, shield, spear, axe, viking, bow];
// const runes = ["green", "blue", "purple", "red", "yellow", "orange"];

export default function Profile() {
  const [currentRuneArrangement, setCurrentRuneArrangement] = useState<
    StaticImageData[]
  >([]);
  const [squareBeingDragged, setSquareBeingDragged] = useState(Object);
  const [squareBeingReplaced, setSquareBeingReplaced] = useState(Object);

  const checkForColumnOfFour = () => {
    // only need to check until the 4rd bottom row
    for (let i = 0; i <= 39; i++) {
      // the indexes in columnOfFour are the indexes of the rows below
      const columnOfFour = [i, i + width, i + width * 2, i + width * 3];
      const decidedRune = currentRuneArrangement[i];
      if (
        columnOfFour.every(
          (index) => currentRuneArrangement[index] === decidedRune
        )
      ) {
        columnOfFour.forEach(
          // replaces the indexes of the runes with an empty string
          (index) => (currentRuneArrangement[index] = blank)
        );
        return true;
      }
    }
  };

  const checkForRowOfFour = () => {
    // only need to check until the 3rd bottom row
    for (let i = 0; i < 64; i++) {
      // the indexes in rowOfFour are the indexes to the right
      const rowOfFour = [i, i + 1, i + 2, i + 3];
      const decidedRune = currentRuneArrangement[i];
      const notValid = [
        5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53,
        54, 55, 62, 63, 64,
      ];

      if (notValid.includes(i)) continue;

      if (
        rowOfFour.every(
          (index) => currentRuneArrangement[index] === decidedRune
        )
      ) {
        rowOfFour.forEach((index) => (currentRuneArrangement[index] = blank));
        return true;
      }
    }
  };

  const checkForColumnOfThree = () => {
    // only need to check until the 3rd bottom row
    for (let i = 0; i <= 47; i++) {
      // the indexes in columnOfThree are the indexes of the rows below
      const columnOfThree = [i, i + width, i + width * 2];
      const decidedRune = currentRuneArrangement[i];
      if (
        columnOfThree.every(
          (index) => currentRuneArrangement[index] === decidedRune
        )
      ) {
        columnOfThree.forEach(
          // replaces the indexes of the runes with an empty string
          (index) => (currentRuneArrangement[index] = blank)
        );
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
      const notValid = [
        6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 63, 64,
      ];

      if (notValid.includes(i)) continue;

      if (
        rowOfThree.every(
          (index) => currentRuneArrangement[index] === decidedRune
        )
      ) {
        rowOfThree.forEach((index) => (currentRuneArrangement[index] = blank));
        return true;
      }
    }
  };

  const moveIntoSquareBelow = () => {
    for (let i = 0; i <= 55; i++) {
      const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
      const isFirstRow = firstRow.includes(i);

      if (isFirstRow && currentRuneArrangement[i] === blank) {
        let randomNumber = Math.floor(Math.random() * runes.length);
        currentRuneArrangement[i] = runes[randomNumber];
      }

      if (currentRuneArrangement[i + width] === blank) {
        currentRuneArrangement[i + width] = currentRuneArrangement[i];
        currentRuneArrangement[i] = blank;
      }
    }
  };

  //   const [currentRuneArrangement, setCurrentRuneArrangement] = useState<
  //     string[]
  //   >([]);
  //   const createBoard = () => {
  //     const randomRuneArrangement = [];
  //     for (let i = 0; i < width * width; i++) {
  //       // Pickes random rune from 0 to 5
  //       const randomRune = runes[Math.floor(Math.random() * runes.length)];
  //       randomRuneArrangement.push(randomRune);
  //     }
  //     setCurrentRuneArrangement(randomRuneArrangement);
  //   };

  // e is the event
  const dragStart = (e: Event) => {
    console.log("drag start");
    setSquareBeingDragged(e.target);
  };
  const dragDrop = (e: Event) => {
    console.log("drag drop", e.target, typeof e.target);
    setSquareBeingReplaced(e.target);
  };
  const dragEnd = (e: Event) => {
    console.log("drag end");

    const squareBeingDraggedId = parseInt(
      squareBeingDragged.getAttribute("data-id")
    );
    const squareBeingReplacedId = parseInt(
      squareBeingReplaced.getAttribute("data-id")
    );

    currentRuneArrangement[squareBeingReplacedId] =
      squareBeingDragged.getAttribute("src");
    currentRuneArrangement[squareBeingDraggedId] =
      squareBeingReplaced.getAttribute("src");

    const validMoves = [
      squareBeingDraggedId - 1,
      squareBeingDraggedId - width,
      squareBeingDraggedId + 1,
      squareBeingDraggedId + width,
    ];
    const validMove = validMoves.includes(squareBeingReplacedId);

    const isAColumnOfFour = checkForColumnOfFour();
    const isARowOfFour = checkForRowOfFour();
    const isAColumnOfThree = checkForColumnOfThree();
    const isARowOfThree = checkForRowOfThree();

    if (
      squareBeingReplacedId &&
      validMove &&
      (isARowOfThree || isARowOfFour || isAColumnOfFour || isAColumnOfThree)
    ) {
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
      checkForColumnOfFour();
      checkForColumnOfThree();
      checkForRowOfFour();
      checkForRowOfThree();
      moveIntoSquareBelow();
      // after checking for matches, set the state to the new arrangement
      setCurrentRuneArrangement([...currentRuneArrangement]);
    }, 100);
    return () => clearInterval(timer);
  }, [
    checkForColumnOfFour,
    checkForColumnOfThree,
    checkForRowOfFour,
    checkForRowOfThree,
    moveIntoSquareBelow,
    currentRuneArrangement,
  ]);

  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div
        className="flex flex-wrap justify-center bg-slate-800 p-10 rounded-lg"
        style={{ width: "560px" }}
      >
        {currentRuneArrangement.map((rune: StaticImageData, index: number) => (
          <img
            className="p-7"
            key={index}
            // style={{ backgroundColor: rune }}
            src={rune}
            data-Id={index}
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
    </main>
  );
}
