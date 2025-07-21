import {
  getRandomWordQuestBoard,
  getWordQuestHint,
  updateGame,
} from "@/data/games/game";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function WordQuest({
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
  const [gameBoard, setGameBoard] = useState<string[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [triedWords, setTriedWords] = useState<string[]>([]);
  const [hints, setHints] = useState<number[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [dragSelectionOrder, setDragSelectionOrder] = useState<number[]>([]);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [manualSelectedIndices, setManualSelectedIndices] = useState<
    Set<number>
  >(new Set());
  const [manualSelectionOrder, setManualSelectionOrder] = useState<number[]>(
    [],
  );

  // Clear board state when gameId changes (new round purchased)
  useEffect(() => {
    if (gameId) {
      // Clear all game state when a new round is purchased
      setGameBoard([]);
      setWords([]);
      setFoundWords([]);
      setTriedWords([]);
      setHints([]);
      setCurrentScore(0);
      setScore(0);
      setSelectedIndices(new Set());
      setDragSelectionOrder([]);
      setManualSelectedIndices(new Set());
      setManualSelectionOrder([]);
      setIsDragging(false);
      setDragStartIndex(null);
    }
  }, [gameId, setScore]);

  const initializeGame = async () => {
    if (!gameId) return;

    if (!gameEnabled) {
      return;
    }
    const gameData = await getRandomWordQuestBoard(gameId);
    setWords(gameData.words);
    setGameBoard(gameData.board.flat());

    // Preserve existing game state if available
    setFoundWords(gameData.foundWords || []);
    setCurrentScore(gameData.score || 0);
    setScore(gameData.score || 0);

    // Reset UI state but preserve game progress
    setTriedWords([]);
    setHints([]);
    setSelectedIndices(new Set());
    setDragSelectionOrder([]);
    setManualSelectedIndices(new Set());
    setManualSelectionOrder([]);
  };

  // Helper function to get row and column from index
  const getRowCol = (index: number) => {
    const row = Math.floor(index / 16);
    const col = index % 16;
    return { row, col };
  };

  // Helper function to get indices in a line between two points with proper ordering
  const getIndicesInLine = (startIndex: number, endIndex: number) => {
    const start = getRowCol(startIndex);
    const end = getRowCol(endIndex);
    const indices: number[] = [];

    // Calculate direction
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    // Only allow horizontal, vertical, or diagonal lines
    if (rowDiff === 0) {
      // Horizontal line
      const step = colDiff > 0 ? 1 : -1;
      for (let col = start.col; col !== end.col + step; col += step) {
        indices.push(start.row * 16 + col);
      }
    } else if (colDiff === 0) {
      // Vertical line
      const step = rowDiff > 0 ? 1 : -1;
      for (let row = start.row; row !== end.row + step; row += step) {
        indices.push(row * 16 + start.col);
      }
    } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
      // Diagonal line
      const rowStep = rowDiff > 0 ? 1 : -1;
      const colStep = colDiff > 0 ? 1 : -1;
      const steps = Math.abs(rowDiff);

      for (let i = 0; i <= steps; i++) {
        const row = start.row + i * rowStep;
        const col = start.col + i * colStep;
        indices.push(row * 16 + col);
      }
    }

    return indices;
  };

  const handleMouseDown = (index: number) => {
    // Don't allow interaction if no game is loaded
    if (gameBoard.length === 0) return;

    if (isManualMode) {
      // In manual mode, toggle letter selection
      const newSelection = new Set(manualSelectedIndices);
      let newOrder = [...manualSelectionOrder];

      if (newSelection.has(index)) {
        newSelection.delete(index);
        newOrder = newOrder.filter((i) => i !== index);
      } else {
        newSelection.add(index);
        newOrder.push(index);
      }

      setManualSelectedIndices(newSelection);
      setManualSelectionOrder(newOrder);
    } else {
      // In drag mode, start dragging
      setIsDragging(true);
      setDragStartIndex(index);
      setSelectedIndices(new Set([index]));
      setDragSelectionOrder([index]);
    }
  };

  const handleMouseEnter = (index: number) => {
    // Don't allow interaction if no game is loaded
    if (gameBoard.length === 0) return;

    if (!isManualMode && isDragging && dragStartIndex !== null) {
      const lineIndices = getIndicesInLine(dragStartIndex, index);
      setSelectedIndices(new Set(lineIndices));
      setDragSelectionOrder(lineIndices);
    }
  };

  const handleMouseUp = () => {
    // In drag mode, just stop dragging but keep the selection for manual checking
    if (!isManualMode) {
      setIsDragging(false);
      setDragStartIndex(null);
    }
  };

  // Helper function to check if manual selection forms a valid line
  const isValidLine = (selectionOrder: number[]) => {
    if (selectionOrder.length < 2) return true; // Single letter or empty is valid

    const positions = selectionOrder.map(getRowCol);

    // Get the direction from the first two selections
    const first = positions[0];
    const second = positions[1];

    const rowDiff = second.row - first.row;
    const colDiff = second.col - first.col;

    // Determine the step direction
    let rowStep = 0,
      colStep = 0;

    if (rowDiff === 0 && colDiff !== 0) {
      // Horizontal line
      colStep = colDiff > 0 ? 1 : -1;
    } else if (colDiff === 0 && rowDiff !== 0) {
      // Vertical line
      rowStep = rowDiff > 0 ? 1 : -1;
    } else if (
      Math.abs(rowDiff) === Math.abs(colDiff) &&
      rowDiff !== 0 &&
      colDiff !== 0
    ) {
      // Diagonal line
      rowStep = rowDiff > 0 ? 1 : -1;
      colStep = colDiff > 0 ? 1 : -1;
    } else {
      return false; // Not a valid direction
    }

    // Check if all subsequent positions follow the same direction
    for (let i = 1; i < positions.length; i++) {
      const expectedRow = first.row + i * rowStep;
      const expectedCol = first.col + i * colStep;

      if (
        positions[i].row !== expectedRow ||
        positions[i].col !== expectedCol
      ) {
        return false;
      }
    }

    return true;
  };

  const clearManualSelection = () => {
    setManualSelectedIndices(new Set());
    setManualSelectionOrder([]);
  };

  const checkWord = async () => {
    const indices = isManualMode ? manualSelectedIndices : selectedIndices;
    const selectionOrder = isManualMode
      ? manualSelectionOrder
      : dragSelectionOrder;
    if (indices.size === 0 || !gameId) return;

    // For manual mode, validate line formation using selection order
    if (isManualMode && !isValidLine(selectionOrder)) {
      toast.error(
        "Letters must form a straight line (horizontal, vertical, or diagonal)!",
      );
      return;
    }

    // Use selection order for both modes to maintain direction
    const orderedIndices = selectionOrder;
    const selectedWord = orderedIndices
      .map((index) => gameBoard[index])
      .join("");

    setTriedWords((prev) => [...prev, selectedWord]);

    try {
      const result = await updateGame(gameId, orderedIndices, 0);
      const newScore = result.score || 0;
      const oldFoundWordsCount = foundWords.length;

      setCurrentScore(newScore);

      // Update found words from metadata
      if (result.metadata && result.metadata.foundWords) {
        setFoundWords(result.metadata.foundWords);

        // Check if a new word was found
        if (result.metadata.foundWords.length > oldFoundWordsCount) {
          toast.success(`🎉 Correct! You found: ${selectedWord}`);

          // Check if all words are found and auto-finish the game
          if (result.metadata.foundWords.length === words.length) {
            setTimeout(() => {
              toast.success("🎊 Congratulations! You found all words!");
              handleFinish();
            }, 1500); // Delay to show the success message first
          }
        } else {
          toast.error(
            `"${selectedWord}" is not a valid word or already found.`,
          );
        }
      }

      // Clear selection after checking
      if (isManualMode) {
        setManualSelectedIndices(new Set());
        setManualSelectionOrder([]);
      } else {
        setSelectedIndices(new Set());
        setDragSelectionOrder([]);
      }
    } catch (error) {
      console.error("Error updating game:", error);
      toast.error("Error checking word. Please try again.");
    }
  };

  const handleFinish = () => {
    setGameEnabled(false);
    handleFinishGame();
  };

  const toggleMode = () => {
    setIsManualMode(!isManualMode);
    setSelectedIndices(new Set());
    setDragSelectionOrder([]);
    setManualSelectedIndices(new Set());
    setManualSelectionOrder([]);
    setIsDragging(false);
    setDragStartIndex(null);
  };

  const getWordHint = async (word: string) => {
    if (!gameId) return;
    try {
      const { score, index } = await getWordQuestHint(gameId, word);
      if (index !== undefined) {
        setCurrentScore(score); // Update local score state
        setScore(score); // Update parent component score
        setHints((prev) => [...prev, index]);
      }
    } catch (error) {
      console.error("Error getting hint:", error);
    }
  };

  return (
    <>
      {words.length > 0 ? (
        <div className="flex flex-wrap text-center justify-center text-xl mb-4 mx-72">
          {words.map((word, idx) => (
            <span
              key={word}
              onClick={() => getWordHint(word)}
              className={`cursor-pointer hover:text-blue-400 transition-colors ${
                foundWords.includes(word) ? "text-green-500 line-through" : ""
              } mr-2 mb-2`}
            >
              {word}
              {idx < words.length - 1 && <span>,&nbsp;</span>}
            </span>
          ))}
        </div>
      ) : null}
      {triedWords.length > 0 && (
        <div className="text-center text-2xl mb-4 mx-40">
          <p>
            Tried Words: <br /> {triedWords.join(", ")}
          </p>
        </div>
      )}
      <div className="text-center text-2xl mb-4 mx-40">
        {
          <p>
            Score: <br /> {currentScore}
          </p>
        }
        <Button
          onClick={() => handleFinish()}
          color="error"
          variant="outlined"
          disabled={gameBoard.length === 0 || !gameEnabled}
        >
          {"Finish Game Early"}
        </Button>
      </div>
      <div className="flex justify-center items-center mb-4 gap-4">
        <Button
          onClick={toggleMode}
          variant={isManualMode ? "contained" : "outlined"}
          disabled={gameBoard.length === 0}
        >
          {isManualMode ? "Manual Mode" : "Drag Mode"}
        </Button>
        {isManualMode ? (
          <>
            <Button
              onClick={clearManualSelection}
              variant="outlined"
              disabled={
                manualSelectedIndices.size === 0 || gameBoard.length === 0
              }
            >
              Clear ({manualSelectedIndices.size} letters)
            </Button>
            <Button
              onClick={checkWord}
              variant="contained"
              disabled={
                manualSelectedIndices.size === 0 ||
                gameBoard.length === 0 ||
                !gameEnabled ||
                !gameId
              }
            >
              Check Word
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => {
                setSelectedIndices(new Set());
                setDragSelectionOrder([]);
              }}
              variant="outlined"
              disabled={selectedIndices.size === 0 || gameBoard.length === 0}
            >
              Clear ({selectedIndices.size} letters)
            </Button>
            <Button
              onClick={checkWord}
              variant="contained"
              disabled={selectedIndices.size === 0 || gameBoard.length === 0}
            >
              Check Word
            </Button>
          </>
        )}
      </div>
      <div className="text-center text-sm text-gray-400 mb-2">
        {gameBoard.length === 0
          ? "Purchase a round and click 'Start Game' to begin playing!"
          : isManualMode
            ? "Click letters in order to spell a word (numbers show selection order). Letters must form a straight line."
            : "Drag across letters to select them in order, then click 'Check Word' to validate."}
      </div>
      <div
        className="mx-72 grid grid-cols-16 gap-2 text-center rounded-xl border-2 border-white p-5 mt-5"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {gameBoard.length === 0
          ? // Show placeholder grid when no game is loaded
            Array.from({ length: 256 }, (_, index) => (
              <div
                key={`placeholder-${index}`}
                className="border p-2 rounded-xl max-w-10 font-mono font-bold select-none bg-gray-800 text-gray-600"
              >
                •
              </div>
            ))
          : gameBoard.map((letter, index) => {
              const isDragSelected = selectedIndices.has(index);
              const isManualSelected = manualSelectedIndices.has(index);
              const isHinted = hints.includes(index);
              const manualOrderIndex = manualSelectionOrder.indexOf(index);
              const dragOrderIndex = dragSelectionOrder.indexOf(index);

              return (
                <div
                  key={`${letter}-${index}`}
                  className={`border p-2 rounded-xl max-w-10 cursor-pointer font-mono font-bold select-none transition-colors relative ${
                    isDragSelected || isManualSelected
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-700"
                  } ${isHinted ? "bg-yellow-300 text-black" : ""} ${
                    isManualSelected ? "ring-2 ring-purple-400" : ""
                  } ${
                    isDragSelected && !isManualSelected
                      ? "ring-2 ring-blue-400"
                      : ""
                  }`}
                  onMouseDown={() => handleMouseDown(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                >
                  {letter}
                  {isManualSelected && manualOrderIndex >= 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {manualOrderIndex + 1}
                    </span>
                  )}
                  {isDragSelected &&
                    !isManualSelected &&
                    dragOrderIndex >= 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {dragOrderIndex + 1}
                      </span>
                    )}
                </div>
              );
            })}
      </div>
      <div className="text-center mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={initializeGame}
          disabled={!gameId}
        >
          Start Game
        </Button>
      </div>
    </>
  );
}

export default WordQuest;
