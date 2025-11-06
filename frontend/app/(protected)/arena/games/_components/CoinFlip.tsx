"use client";
import { initializeCoinFlipGame, flipCoin } from "@/data/games/game";
import { useCallback, useRef, useState } from "react";
import { Button, Input, Paper, Divider, Box } from "@mui/material";
import { toast } from "react-toastify";
import Image from "next/image";

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

  // UI state for coin animation (chatgpt replaced framer-motion package with this instead. So sue me for using AI)
  const coinRef = useRef<HTMLDivElement | null>(null);
  type Bezier = [number, number, number, number];
  const controls = {
    async start({ rotateY, transition }: { rotateY: number; transition?: { duration?: number; ease?: Bezier } }) {
      return new Promise<void>((resolve) => {
        const el = coinRef.current;
        if (!el) return resolve();
        const duration = transition?.duration ?? 0.3;
        const ease = transition?.ease ?? [0.25, 0.1, 0.25, 1.0];
        el.style.transition = `transform ${duration}s cubic-bezier(${ease.join(",")})`;
        const handle = () => {
          el.removeEventListener("transitionend", handle);
          resolve();
        };
        el.addEventListener("transitionend", handle, { once: true } as any);
        el.style.transform = `rotateY(${rotateY}deg)`;
      });
    },
    set({ rotateY }: { rotateY: number }) {
      const el = coinRef.current;
      if (!el) return;
      el.style.transition = "none";
      el.style.transform = `rotateY(${rotateY}deg)`;
      // Force reflow before allowing future transitions
      void el.offsetHeight;
    },
  };

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
        await startCoinFlipGame();
        setInitialized(true);
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
            <div
              ref={coinRef}
              style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", cursor: "default", willChange: "transform", transform: "rotateY(0deg)" }}
            >
              {/* Heads side */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  backfaceVisibility: "hidden",
                  overflow: "hidden",
                  // Subtle metallic ring and fallback color
                  boxShadow: "inset 0 0 0 5px #B8860B, inset 0 0 0 10px #FFD700",
                  background: "radial-gradient(circle at 35% 30%, #ffd95a, #ffc800)",
                }}
              >
                <Image
                  src="/items/heads-coin-2005.png"
                  alt="Heads"
                  fill
                  style={{ objectFit: "cover", transform: "scale(1.03)", transformOrigin: "50% 50%" }}
                  priority
                  draggable={false}
                />
              </Box>

              {/* Tails side */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  overflow: "hidden",
                  boxShadow: "inset 0 0 0 5px #B8860B, inset 0 0 0 10px #FFD700",
                  background: "radial-gradient(circle at 35% 30%, #ffd95a, #ffc800)",
                }}
              >
                <Image
                  src="/items/tails-coin-2005.png"
                  alt="Tails"
                  fill
                  style={{ objectFit: "cover", transform: "scale(1.03)", transformOrigin: "50% 50%" }}
                  priority
                  draggable={false}
                />
              </Box>
            </div>
            {/* Shadow */}
            <div
              style={{ position: "absolute", bottom: -6, left: "50%", width: 140, height: 24, background: "#000", borderRadius: 999, opacity: 0.18, filter: "blur(6px)", transform: `translateX(-50%) scale(${loading ? 0.75 : 1}, ${loading ? 0.75 : 1})`, transition: "transform 0.4s ease" }}
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
