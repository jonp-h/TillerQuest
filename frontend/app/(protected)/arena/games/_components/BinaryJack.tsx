"use client";
import {
  rollBinaryJackDice,
  applyBinaryOperation,
  initializeBinaryJackGame,
  startBinaryJackRound,
} from "@/data/games/game";
import { diceSettings } from "@/lib/diceSettings";
import DiceBox from "@3d-dice/dice-box-threejs";
import { Button, Divider, Input } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Game configuration constants
const MAX_TURNS = 6; // Change this value to adjust maximum rounds/turns

function BinaryJack({
  gameEnabled,
  setGameEnabled,
  handleFinishGame,
  gameId,
  userGold,
}: {
  gameEnabled: boolean;
  setGameEnabled: (enabled: boolean) => void;
  handleFinishGame: () => void;
  gameId: string | null;
  userGold: number;
}) {
  const [diceBox, setDiceBox] = useState<DiceBox | null>(null);
  const [currentlyRolling, setCurrentlyRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDie, setSelectedDie] = useState<string>("d6");
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [stake, setStake] = useState<number>(1);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [rolledValue, setRolledValue] = useState<number | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  const [turnsRemaining, setTurnsRemaining] = useState<number>(MAX_TURNS);
  const [availableDice, setAvailableDice] = useState<string[]>([]);
  const [availableOperations, setAvailableOperations] = useState<string[]>([]);

  // ---------------- Initialize dice ----------------

  const initializeDiceBox = async () => {
    try {
      const newDiceBox = new DiceBox("#dice-canvas", diceSettings);
      await newDiceBox.initialize();
      setDiceBox(newDiceBox);
    } catch (error) {
      console.error("Error initializing DiceBox:", error);
    }
  };

  // Delay of 500ms to prevent the dice box from rendering before the component is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeDiceBox();
    }, 500);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

  const handleSetStake = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      const maxStake = Math.floor(userGold * 0.5);
      if (value <= maxStake) {
        setStake(value);
      } else {
        toast.warning(
          `Stake cannot exceed 50% of your gold (${maxStake} gold)`,
        );
      }
    } else if (e.target.value === "") {
      setStake(1);
    }
  };

  const handleSetTargetNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow binary digits (0 or 1)
    if (/^[01]*$/.test(value)) {
      const num = parseInt(value, 2);
      if (!isNaN(num) && num >= 0 && num <= 31) {
        setTargetNumber(num);
      } else {
        setTargetNumber(0);
      }
    } else {
      toast.error("Only binary digits (0 and 1) are allowed.");
    }
  };

  const handleStartGame = async () => {
    if (!gameEnabled || !gameId) {
      return;
    }

    setGameEnabled(true);

    try {
      // Initialize the BinaryJack game with the target number and stake
      const result = await initializeBinaryJackGame(
        gameId,
        targetNumber,
        stake,
      );

      setCurrentValue(result.currentValue);
      setTurnsRemaining(result.turnsRemaining);
      setGameStarted(true);

      if (!diceBox) {
        initializeDiceBox();
        toast.info("Preparing dice..", { autoClose: 1000 });
      } else if (diceBox) {
        diceBox.clearDice();
        // TODO: enable custom colorsets
        // diceBox.updateConfig({
        //   ...diceSettings,
        //   theme_customColorset: colorsets.fire,
        // });
      }

      toast.success("Game started! Roll the dice to begin.");

      // Start the first round
      await startNewRound();
    } catch (error) {
      toast.error("Failed to start game. Please try again.");
      console.error("Error starting game:", error);
    }
  };

  const handleRollDice = async () => {
    if (!gameId) return;

    const result = await rollBinaryJackDice(gameId, selectedDie);

    if (result.diceRoll && diceBox) {
      setCurrentlyRolling(true);
      diceBox
        .roll(`${selectedDie}@${result.diceRoll}`)
        .then(() => {
          setRolledValue(result.rolledValue);
        })
        .finally(() => {
          setCurrentlyRolling(false);
        });
    }
  };

  const handleApplyOperation = async () => {
    if (!gameId || !selectedOperation || rolledValue === null) return;

    try {
      const result = await applyBinaryOperation(
        gameId,
        selectedOperation,
        currentValue,
        rolledValue,
      );

      setCurrentValue(result.newValue);
      setTurnsRemaining(result.turnsRemaining);

      // Reset for next round
      setRolledValue(null);
      setSelectedOperation("");

      // Check if game should end
      if (result.hitTarget) {
        setGameStarted(false);
        handleFinishGame();
      } else if (result.turnsRemaining <= 0) {
        toast.info("Game over - no turns remaining");
        setGameStarted(false);
        handleFinishGame();
      } else {
        // Start new round with new dice/operation choices
        await startNewRound();
      }
    } catch (error) {
      toast.error("Failed to apply operation. Please try again.");
      console.error("Error applying operation:", error);
    }
  };

  const startNewRound = async () => {
    if (!gameId) return;

    if (diceBox) {
      diceBox.clearDice();
    }

    try {
      const roundData = await startBinaryJackRound(gameId);
      setAvailableDice(roundData.availableDice);
      setAvailableOperations(roundData.availableOperations);

      // Reset round state
      setSelectedDie(roundData.availableDice[0]); // Default to first available die
      setRolledValue(null);
      setSelectedOperation("");
    } catch (error) {
      toast.error("Failed to start new round. Please try again.");
      console.error("Error starting new round:", error);
    }
  };

  return (
    <>
      <div
        id="dice-canvas"
        className="fixed mt-24 z-10 inset-0 w-full h-11/12 pointer-events-none"
      />

      {/* How to Play Section */}

      <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
        <h3 className="text-lg font-bold mb-3 text-purple-400">
          How to Play BinaryJack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Objective:</h4>
            <p className="text-gray-300 mb-3">
              Reach your target number using binary operations within the turn
              limit.
            </p>

            <h4 className="font-semibold text-green-300 mb-2">Each Round:</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Get 2 random dice choices</li>
              <li>• Get 2 random operations</li>
              <li>• Pick a die and roll it</li>
              <li>• Choose an operation to apply</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-300 mb-2">
              Binary Operations:
            </h4>
            <div className="text-gray-300 space-y-1 text-xs">
              <p>
                <span className="font-mono bg-gray-700 px-1">AND</span> - Both
                bits must be 1
              </p>
              <p>
                <span className="font-mono bg-gray-700 px-1">OR</span> - At
                least one bit is 1
              </p>
              <p>
                <span className="font-mono bg-gray-700 px-1">XOR</span> -
                Exactly one bit is 1
              </p>
              <p>
                <span className="font-mono bg-gray-700 px-1">NAND</span> - NOT
                AND (inverted)
              </p>
              <p>
                <span className="font-mono bg-gray-700 px-1">NOR</span> - NOT OR
                (inverted)
              </p>
              <p>
                <span className="font-mono bg-gray-700 px-1">XNOR</span> - NOT
                XOR (inverted)
              </p>
            </div>

            <h4 className="font-semibold text-red-300 mb-2 mt-3">Wagering:</h4>
            <p className="text-gray-300 text-xs">
              Set a stake (max 50% of your gold). Win = double your stake, Lose
              = lose your stake
            </p>
          </div>
        </div>
      </div>

      <div className="font-mono p-4 border rounded-lg">
        {/* Game Status Panel */}
        {gameStarted && (
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg border-2 border-purple-500">
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* Turns Left */}
              <div>
                <div className="text-sm text-white mb-2 font-semibold">
                  Turns Left
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-3xl font-bold text-yellow-500 drop-shadow-lg">
                    {turnsRemaining}
                  </div>
                  <div className="text-sm font-sans text-yellow-400 tracking-widest border-t border-gray-400 pt-1">
                    {`Round ${MAX_TURNS + 1 - turnsRemaining}`}
                  </div>
                </div>
              </div>
              {/* Target */}
              <div>
                <div className="text-sm text-white mb-2 font-semibold">
                  Target Value
                </div>
                <div className="bg-black/50 rounded-lg p-3 font-mono">
                  <div className="text-3xl font-bold text-red-500 drop-shadow-lg">
                    {targetNumber}
                  </div>
                  <div className="text-sm text-red-400 tracking-widest border-t border-gray-400 pt-1">
                    {targetNumber.toString(2).padStart(5, "0")}
                  </div>
                </div>
              </div>
              {/* Current Value */}
              <div>
                <div className="text-sm text-white mb-2 font-semibold">
                  Current Value
                </div>
                <div className="bg-black/30 rounded-lg p-3 font-mono">
                  <div className="text-3xl font-bold text-green-400 drop-shadow-lg">
                    {currentValue}
                  </div>
                  <div className="text-sm text-green-300 tracking-widest border-t border-gray-400 pt-1">
                    {currentValue.toString(2).padStart(5, "0")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Divider />

        {!gameStarted && (
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-900 to-blue-800 border-blue-400 rounded-lg border-2">
            <div className="flex flex-col gap-3 bg-black/30 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter target in binary (5 bits, 1-30):
                </label>
                <Input
                  type="text"
                  value={targetNumber.toString(2).padStart(5, "0")}
                  disabled={!gameEnabled || gameStarted}
                  onChange={handleSetTargetNumber}
                  placeholder="Enter binary (0-30)"
                  inputProps={{ min: 1, max: 30, pattern: "[01]*" }}
                  className="w-full"
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    "& .MuiInputBase-input": {
                      color: "white",
                      fontFamily: "monospace",
                      fontSize: "1.2rem",
                      textAlign: "center",
                    },
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Decimal value: {targetNumber}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Set your stake (max {Math.floor(userGold * 0.5)} gold):
                </label>
                <Input
                  type="number"
                  value={stake}
                  disabled={!gameEnabled || gameStarted}
                  onChange={handleSetStake}
                  placeholder="Enter stake amount"
                  inputProps={{ min: 1, max: Math.floor(userGold * 0.5) }}
                  className="w-full"
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    "& .MuiInputBase-input": {
                      color: "white",
                      fontSize: "1.2rem",
                      textAlign: "center",
                    },
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Your gold: {userGold} | Win: {stake * 2} gold | Lose: -{stake}{" "}
                  gold
                </p>
              </div>

              <Button
                variant="contained"
                color="primary"
                onClick={handleStartGame}
                disabled={
                  !gameEnabled ||
                  targetNumber < 1 ||
                  targetNumber > 30 ||
                  stake < 1 ||
                  stake > Math.floor(userGold * 0.5) ||
                  stake > userGold
                }
                className="w-full"
              >
                🎲 Start BinaryJack Game
              </Button>
            </div>
          </div>
        )}

        {gameStarted && (
          <div className="mt-4 space-y-6">
            {/* Dice Selection Section - Only show when no value is rolled */}
            {rolledValue === null ? (
              <div>
                <h3 className="text-center text-lg font-bold mb-2 flex items-center justify-center gap-2">
                  🎲 Choose Die Type
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {availableDice.map((die) => (
                    <div
                      key={die}
                      className={`p-4 rounded-lg border-2 text-center font-bold transition-all duration-200 ${
                        selectedDie === die
                          ? "bg-gradient-to-br from-purple-900 to-blue-800 border-blue-400  shadow-lg transform scale-105 cursor-pointer"
                          : "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:border-gray-500 hover:from-gray-600 hover:to-gray-700 cursor-pointer"
                      } ${!gameEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => (gameEnabled ? setSelectedDie(die) : null)}
                    >
                      <div className="text-2xl mb-2">{die.toUpperCase()}</div>
                      <div className="text-sm text-gray-300 bg-black/30 rounded px-2 py-1">
                        Range: {die === "d4" && "1-4"}
                        {die === "d6" && "1-6"}
                        {die === "d8" && "1-8"}
                        {die === "d10" && "1-10"}
                        {die === "d20" && "1-20"}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleRollDice}
                  disabled={!gameEnabled || currentlyRolling || !diceBox}
                  className="w-full"
                >
                  🎲 Roll {selectedDie.toUpperCase()}
                </Button>
              </div>
            ) : (
              /* Rolled Value Display - When dice has been rolled */
              <div className="bg-gradient-to-r from-purple-900 to-blue-800 rounded-xl shadow-lg p-6 text-center mx-auto border-2 border-blue-400">
                <div className="text-xl font-extrabold text-blue-200 mb-3">
                  🎲 Rolled Value
                </div>
                <div className="bg-black/40 rounded-lg p-4 font-mono">
                  <div className="text-4xl font-bold text-cyan-300 drop-shadow-lg mb-2">
                    {rolledValue}
                  </div>
                  <div className="text-lg text-blue-100 tracking-widest border-t border-gray-400 pt-2">
                    Binary: {rolledValue.toString(2).padStart(5, "0")}
                  </div>
                </div>
              </div>
            )}

            {/* Binary Operations Section - Always show when game started, but lock when no dice rolled */}
            <div>
              <h3 className="text-center text-lg font-bold mb-2 flex items-center justify-center gap-2">
                ⚡ Choose Operation
                {rolledValue === null && (
                  <span className="text-sm text-gray-400 font-normal">
                    (Roll dice first)
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {availableOperations.map((operation) => {
                  // Calculate result - use 0 if no dice rolled yet
                  const rolledVal = rolledValue ?? 0;
                  const result = (() => {
                    switch (operation) {
                      case "AND":
                        return currentValue & rolledVal;
                      case "OR":
                        return currentValue | rolledVal;
                      case "XOR":
                        return currentValue ^ rolledVal;
                      case "NAND":
                        return ~(currentValue & rolledVal) & 0x1f;
                      case "NOR":
                        return ~(currentValue | rolledVal) & 0x1f;
                      case "XNOR":
                        return ~(currentValue ^ rolledVal) & 0x1f;
                      default:
                        return 0;
                    }
                  })();

                  const isLocked = rolledValue === null;

                  return (
                    <div
                      key={operation}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedOperation === operation && !isLocked
                          ? "bg-gradient-to-br from-purple-900 to-blue-800 border-blue-400 shadow-lg transform scale-105 cursor-pointer"
                          : isLocked
                            ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 opacity-50 cursor-not-allowed"
                            : "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:border-gray-500 hover:from-gray-600 hover:to-gray-700 cursor-pointer"
                      } ${!gameEnabled ? "opacity-30 cursor-not-allowed" : ""}`}
                      onClick={() =>
                        gameEnabled && !isLocked
                          ? setSelectedOperation(operation)
                          : null
                      }
                    >
                      {/* Operation Header */}
                      <div className="text-center mb-3">
                        <div
                          className={`font-bold text-lg rounded px-2 py-1 inline-block ${
                            isLocked
                              ? "text-gray-400 bg-black/20"
                              : "text-white bg-black/30"
                          }`}
                        >
                          {operation}
                          {isLocked && <span className="ml-2">🔒</span>}
                        </div>
                      </div>

                      {/* Mathematical Formula Display */}
                      <div
                        className={`font-mono text-center rounded-lg p-4 ${
                          isLocked ? "bg-black/20" : "bg-black/40"
                        }`}
                      >
                        {/* Current Value */}
                        <div className="flex justify-between items-center text-base">
                          <span
                            className={
                              isLocked ? "text-green-600" : "text-green-400"
                            }
                          >
                            Current:
                          </span>
                          <div className="text-right ml-6">
                            <span
                              className={`font-bold text-lg ${isLocked ? "text-green-600" : "text-green-400"}`}
                            >
                              {currentValue.toString(2).padStart(5, "0")}
                            </span>
                          </div>
                        </div>

                        {/* Rolled Value */}
                        <div className="flex justify-between items-center text-base">
                          <span
                            className={
                              isLocked ? "text-cyan-600" : "text-cyan-400"
                            }
                          >
                            Rolled:
                          </span>
                          <div className="text-right ml-6">
                            <span
                              className={`font-bold text-lg ${isLocked ? "text-cyan-600" : "text-cyan-400"}`}
                            >
                              {isLocked
                                ? "-----"
                                : rolledValue!.toString(2).padStart(5, "0")}
                            </span>
                          </div>
                        </div>

                        {/* Divider Line */}
                        <div
                          className={`border-t my-1 ${isLocked ? "border-gray-600" : "border-yellow-400"}`}
                        ></div>

                        {/* Result */}
                        <div className="flex justify-between items-center text-base">
                          <span
                            className={
                              isLocked ? "text-red-600" : "text-red-400"
                            }
                          >
                            Result:
                          </span>
                          <div className="text-right ml-6">
                            <span
                              className={`font-bold text-lg ${isLocked ? "text-red-600" : "text-red-400"}`}
                            >
                              {isLocked
                                ? "-----"
                                : result.toString(2).padStart(5, "0")}
                            </span>
                          </div>
                        </div>

                        {/* Target Match Indicator */}
                        {!isLocked && result === targetNumber && (
                          <div className="mt-3 text-center">
                            <span className="bg-green-500 text-white px-3 py-2 rounded-full text-sm font-bold animate-pulse">
                              🎯 TARGET HIT!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyOperation}
                disabled={
                  !gameEnabled || !selectedOperation || rolledValue === null
                }
                className="w-full"
              >
                ⚡ Apply {selectedOperation || "Operation"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BinaryJack;
