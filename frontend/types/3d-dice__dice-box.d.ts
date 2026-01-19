type texture =
  | "cloudy"
  | "cloudy_2"
  | "fire"
  | "marble"
  | "water"
  | "ice"
  | "paper"
  | "speckles"
  | "glitter"
  | "glitter_2"
  | "stars"
  | "stainedglass"
  | "wood"
  | "metal"
  | "leopard"
  | "tiger"
  | "cheetah"
  | "dragon"
  | "lizard"
  | "astral"
  | "bronze01"
  | "bronze02"
  | "bronze03"
  | "bronze03a"
  | "bronze03b"
  | "bronze04"
  | "skulls"
  | "bird"
  | "none";

interface diceColorset {
  foreground: string | string[];
  background: string | string[];
  edge?: string | string[];
  outline?: string | string[];
  texture?: texture | texture[];
}

interface DiceSettings {
  framerate?: number; // 1 / 60
  sounds?: boolean;
  volume?: number;
  sound_diematerial?: string;
  color_spotlight?: string; // the spotlight/lightsource color
  shadows?: boolean;
  theme_surface?: string;
  assetPath?: string;
  theme_customColorset?: {
    // | (typeof colorsets)[keyof typeof colorsets]
    background?: string | string[];
    foreground?: string | string[];
    edge?: string | string[];
    outline?: string | string[];
    texture?: texture | texture[];
    material?: "metal" | "glass" | "plastic" | "wood";
  };
  light_intensity?: number;
  gravity_multiplier?: number;
  baseScale?: number;
  strength?: number; // toss strength of dice
  onRollComplete?: (results: string) => void;
}

// https://www.npmjs.com/package/@3d-dice/dice-box-threejs
declare module "@3d-dice/dice-box-threejs" {
  /**
   * Represents a 3D dice box for rolling dice with various notations.
   */
  export default class DiceBox {
    /**
     * Creates an instance of DiceBox.
     * @param container - The CSS selector of the container element where the dice box will be rendered.
     * @param options - The settings for the dice box.
     */
    constructor(container: string, options: DiceSettings);

    /**
     * Initializes the dice box.
     * @returns A promise that resolves when the dice box is initialized.
     */
    initialize(): Promise<void>;

    /**
     * Rolls the dice based on the provided notation.
     * @param diceNotation - The dice notation (e.g., "6d6") or a predeterministic notation (e.g., "6d6@3,3,3,3,3,3").
     * @returns A promise that resolves with the result of the roll, including the notation, sets of dice, and the total.
     */
    roll(diceNotation: string): Promise<{
      notation: string;
      sets: object[];
      total: number;
    }>;

    /**
     * Clears all dice from the dice box.
     */
    clearDice(): void;

    /**
     * Re-rolls the specified dice objects.
     * @param diceObjects - An array of dice objects to re-roll.
     */
    reRoll(diceObjects: string[]): void;

    /**
     * Removes the specified dice object(s) from the dice box.
     * @param diceObject - A dice object or an array of dice objects to remove.
     */
    remove(diceIdArray: string[]): void;

    /**
     * Hides the dice box.
     * @param className - An optional class name to add to the <canvas> element for a CSS-based transition. If not provided, visibility is toggled off without an effect.
     */
    hide(className?: string): void;

    /**
     * Shows the dice box.
     * If a className was defined in the hide() method, this class name will be removed from the canvas to reverse the hide effect. Otherwise, visibility is toggled on.
     */
    show(): void;

    /**
     * Returns the results of any dice in the scene. Dice rolling will not have a value.
     * @returns An array of strings representing the results.
     */
    getRollResults(): string[];

    /**
     * Updates the configuration settings for the dice box. Theme/dice color changes will only take effect before or after a roll.
     * @param options - The updated settings for the dice box.
     */
    updateConfig(options: DiceSettings): void;
  }
}
