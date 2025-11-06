"use client";
import { initializeCoinFlipGame, flipCoin } from "@/data/games/game";
import { useCallback, useState } from "react";
import { Button, Input, Paper, Divider } from "@mui/material";
import { toast } from "react-toastify";

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
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  // last outcome (can be wired into UI later)
  const [lastResult, setLastResult] = useState<{
    result: CoinSide;
    playerChoice: CoinSide;
    win: boolean;
    stake: number;
    payout: number;
  } | null>(null);

  // Copy of BinaryJack stake validation
  const handleSetStake = useCallback(
    (value: number) => {
      if (Number.isNaN(value)) return;
      if (value < 1) return;
      const maxStake = Math.floor(userGold * 0.5);
      if (value > maxStake) {
        return;
      }
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
    if (!gameId) return null;
    const res = await flipCoin(gameId, playerChoice);
    setLastResult(res);
    return res;
  }, [gameId, playerChoice]);

  const onFlipClick = useCallback(async () => {
    if (!gameId) {
      toast.error("No game session available.");
      return;
    }
    try {
      setLoading(true);
      if (!initialized) {
        await startCoinFlipGame();
        setInitialized(true);
      }
      const res = await executeFlip();
      if (res) {
        if (res.win) {
          toast.success(`WIN! Result: ${res.result}. Payout: ${res.payout}`);
        } else {
          toast.info(`LOSS. Result: ${res.result}.`);
        }
        // Let handle finish payout
        handleFinishGame();
      }
    } catch (e: any) {
      const msg = e?.message || "Failed to flip the coin";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [executeFlip, initialized, gameId, startCoinFlipGame, handleFinishGame]);

  return (
    <Paper elevation={2} sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label htmlFor="coinflip-stake" style={{ fontWeight: 500 }}>Stake</label>
        <Input
          id="coinflip-stake"
          type="number"
          value={stake}
          onChange={(e) => {
            const val = e.target.value === "" ? 1 : parseInt(e.target.value, 10);
            if (Number.isNaN(val)) return;
            const maxStake = Math.floor(userGold * 0.5);
            if (val > maxStake) {
              // copy BinaryJack UX
              toast.warning(`Stake cannot exceed 50% of your gold (${maxStake} gold)`);
              return;
            }
            handleSetStake(val);
          }}
          inputProps={{ min: 1 }}
          sx={{ width: 120 }}
        />
      </div>

      <Divider />

      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant={playerChoice === "Heads" ? "contained" : "outlined"}
          onClick={() => handleSetChoice("Heads")}
          disabled={loading}
        >
          Heads
        </Button>
        <Button
          variant={playerChoice === "Tails" ? "contained" : "outlined"}
          onClick={() => handleSetChoice("Tails")}
          disabled={loading}
        >
          Tails
        </Button>
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={onFlipClick}
        disabled={loading || !gameId}
      >
        {loading ? "Flipping..." : "FLIP!"}
      </Button>
    </Paper>
  );
}
