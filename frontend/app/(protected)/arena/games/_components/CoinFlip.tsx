"use client";
import { initializeCoinFlipGame, flipCoin } from "@/data/games/game";
import { useCallback, useState } from "react";

// Keep coin sides explicit
export type CoinSide = "Heads" | "Tails";

// Use same props from BinaryJack
export interface CoinFlipProps {
  gameEnabled: boolean;
  setGameEnabled: (enabled: boolean) => void;
  handleFinishGame: () => void;
  gameId: string | null;
  userGold: number;
}

export default function CoinFlip({
  gameEnabled,
  setGameEnabled,
  handleFinishGame,
  gameId,
  userGold,
}: CoinFlipProps) {
  // stake controls
  const [stake, setStake] = useState<number>(1);
  const [playerChoice, setPlayerChoice] = useState<CoinSide>("Heads");

  // last outcome (can be wired into UI later)
  const [lastResult, setLastResult] = useState<{
    result: CoinSide;
    playerChoice: CoinSide;
    win: boolean;
    stake: number;
    payout: number;
  } | null>(null);

  // Copy of BinaryJack's stake validation
  const handleSetStake = useCallback(
    (value: number) => {
      if (Number.isNaN(value)) return;
      if (value < 1) return;
      const maxStake = Math.floor(userGold * 0.5);
      if (value > maxStake) return;
      setStake(value);
    },
    [userGold],
  );

  // Helper to set choice (Heads/Tails)
  const handleSetChoice = useCallback((choice: CoinSide) => {
    setPlayerChoice(choice);
  }, []);

  // Deposit stake and transition to INPROGRESS (server validates)
  const startCoinFlipGame = useCallback(async () => {
    if (!gameId) return;
    // allow enabling the game before/after server call depending on UI flow
    if (!gameEnabled) setGameEnabled(true);
    await initializeCoinFlipGame(gameId, stake);
  }, [gameEnabled, gameId, setGameEnabled, stake]);

  // Execute CoinFlip
  const executeFlip = useCallback(async () => {
    if (!gameId) return;
    const res = await flipCoin(gameId, playerChoice);
    setLastResult(res);
    // Hook to call for settlement Shadow Wizard Money Gang
  }, [gameId, playerChoice]);

  return null;
}
