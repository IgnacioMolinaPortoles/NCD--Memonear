import { PersistentVector, RNG, context, PersistentMap, u128 } from "near-sdk-as";

export enum State {
  InProgress,
  Finished,
}

@nearBindgen
export class Memonear {
  gameId: u32;
  player: string
  gameState: State;
  gameDeposit: u128;
  gameBoard: Array<string[]>;
  matchCount: u32
  userPlays: u32

  constructor() {
    let rng = new RNG<u32>(1, u32.MAX_VALUE);
    let roll = rng.next();
    this.gameId = roll;
    this.gameBoard = new Array<string[]>(3);

    this.gameState = State.InProgress;
    this.gameDeposit = context.attachedDeposit;
    this.player = context.sender
    this.matchCount = 0
    this.userPlays = 0

    let gamesItems: Array<string> = [
      "slime_pink.png",
      "slime_fire.png",
      "slime_cat.png",
      "slime_gold.png",
      "slime_rainbow.png",
      "slime_plant.png",
      "slime_pink.png",
      "slime_fire.png",
      "slime_cat.png",
      "slime_gold.png",
      "slime_rainbow.png",
      "slime_plant.png",
    ];

    for (let i = 0; i < 3; i++) {
      this.gameBoard[i] = new Array<string>(4);
      for (let j = 0; j < 4; j++) {
        let rng = new RNG<u32>(1, gamesItems.length);
        let index = rng.next();

        this.gameBoard[i][j] = gamesItems[index];
        gamesItems.splice(index, 1);
      }
    }
  }
}

export const games = new PersistentMap<u32, Memonear>("g");
