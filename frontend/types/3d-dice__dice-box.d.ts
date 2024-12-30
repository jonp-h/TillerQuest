declare module "@3d-dice/dice-box" {
  export default class DiceBox {
    constructor(options: {
      container: string;
      assetPath: string;
      themeColor?: string;
      scale?: number;
      gravity?: number;
      restitution?: number;
      settleTimeout?: number;
    });

    init(): Promise<void>;
    roll(diceNotation: string): Promise<any>;
    // {
    //   data: {
    //     dieType: string;
    //     groupId: number;
    //     rollId: number;
    //     sides: number;
    //     theme: string;
    //     themeColor: string;
    //     value: number;
    //   }[];
    // }
    clear(): Promise<void>;
  }
}
