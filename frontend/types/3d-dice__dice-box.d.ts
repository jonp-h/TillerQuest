interface DiceSettings {
  framerate?: number; // 1 / 60
  sounds?: boolean;
  volume?: number;
  sound_diematerial?: string;
  color_spotlight?: string; // the spotlight/lightsource color
  shadows?: boolean;
  theme_surface?: string;
  assetPath?: string;
  theme_customColorset?: // | (typeof colorsets)[keyof typeof colorsets]
  {
    background?: string | string[];
    foreground?: string;
    outline?: string;
    texture?:
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
      | "none";
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
  export default class DiceBox {
    constructor(container: string, options: DiceSettings);

    initialize(): Promise<void>;
    // normal dice notation, or predeterministic on the form "6d6@3,3,3,3,3,3"
    roll(diceNotation: string): Promise<{
      notation: string;
      sets: object[];
      total: number;
    }>;

    // clear(): Promise<void>;
  }
}
