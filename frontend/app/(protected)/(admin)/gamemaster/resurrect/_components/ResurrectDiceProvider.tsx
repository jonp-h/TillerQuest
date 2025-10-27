"use client";
import { diceSettings } from "@/lib/diceSettings";
import DiceBox from "@3d-dice/dice-box-threejs";
import { createContext, useContext, useEffect, useState } from "react";

interface DiceContextType {
  diceBox: DiceBox | null;
  isReady: boolean;
}

const DiceContext = createContext<DiceContextType>({
  diceBox: null,
  isReady: false,
});

export const useDiceBox = () => useContext(DiceContext);

export default function ResurrectDiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [diceBox, setDiceBox] = useState<DiceBox | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const newDiceBox = new DiceBox("#dice-canvas", diceSettings);
        await newDiceBox.initialize();
        setDiceBox(newDiceBox);
        setIsReady(true);
      } catch (error) {
        console.error("Error initializing DiceBox:", error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DiceContext.Provider value={{ diceBox, isReady }}>
      {children}
    </DiceContext.Provider>
  );
}
