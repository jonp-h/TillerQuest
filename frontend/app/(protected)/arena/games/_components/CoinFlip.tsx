"use client";
import { initializeCoinFlipGame, flipCoin } from "@/data/games/game";
import { useCallback, useState } from "react";
import { Button, Input, Paper, Divider, Box } from "@mui/material";
import { toast } from "react-toastify";
import { motion, useAnimation } from "framer-motion";

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

  // UI state for coin animation
  const controls = useAnimation();

  // LO
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
        // Fake flip the coin to land on server result (result is calculated SS)
        const endOffset = res.result === "Tails" ? 180 : 0;
        await controls.start({
          rotateY: 1800 + endOffset,
          transition: {
            duration: 1.8,
            ease: [0.645, 0.045, 0.355, 1.0],
          },
        });
        controls.set({ rotateY: endOffset });

        if (res.win) {
          toast.success(`WIN! Result: ${res.result}. Payout: ${res.payout}`);
        } else {
          toast.info(`LOSS. Result: ${res.result}.`);
        }
        // Settle payout on server
        handleFinishGame();
      }
    } catch (e: any) {
      const msg = e?.message || "Failed to flip the coin";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [executeFlip, initialized, gameId, startCoinFlipGame, handleFinishGame, controls]);

  return (
    <Paper elevation={2} sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Box for coin */}
      <Box sx={{ position: "relative", alignSelf: "center", width: 180, height: 180 }}>
        {/* Border */}
        <Paper elevation={3} sx={{ position: "absolute", inset: 0, p: 1, borderRadius: 2 }}>
          <Box sx={{ position: "relative", width: "100%", height: "100%", perspective: 1000 }}>
            <motion.div
              animate={controls}
              style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", cursor: "default" }}
            >
              {/* Heads side */}
              <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", backfaceVisibility: "hidden", overflow: "hidden" }}>
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <circle cx="100" cy="100" r="90" fill="#FFD700" stroke="#B8860B" strokeWidth="5" />
                  <circle cx="100" cy="100" r="80" fill="#FFC800" />
                  <text x="100" y="115" fontSize="60" textAnchor="middle" fill="#B8860B" fontWeight="bold">H</text>
                  <circle cx="100" cy="100" r="40" fill="none" stroke="#B8860B" strokeWidth="2" />
                </svg>
              </Box>
              {/* Tails side */}
              <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", backfaceVisibility: "hidden", transform: "rotateY(180deg)", overflow: "hidden" }}>
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <circle cx="100" cy="100" r="90" fill="#FFD700" stroke="#B8860B" strokeWidth="5" />
                  <circle cx="100" cy="100" r="80" fill="#FFC800" />
                  <text x="100" y="115" fontSize="60" textAnchor="middle" fill="#B8860B" fontWeight="bold">T</text>
                  <path d="M60,80 Q100,120 140,80" fill="none" stroke="#B8860B" strokeWidth="3" />
                </svg>
              </Box>
            </motion.div>
            {/* Shadow */}
            <motion.div
              style={{ position: "absolute", bottom: -6, left: "50%", width: 140, height: 24, background: "#000", borderRadius: 999, opacity: 0.18, filter: "blur(6px)", transform: "translateX(-50%)" }}
              animate={{ scaleX: loading ? 0.75 : 1, scaleY: loading ? 0.75 : 1 }}
              transition={{ duration: 0.4 }}
            />
          </Box>
        </Paper>
      </Box>

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
