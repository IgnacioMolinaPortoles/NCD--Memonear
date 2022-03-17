import { games, Memonear, State } from "./models";
import { context, ContractPromiseBatch, logging, u128 } from "near-sdk-as";
import { ONE_NEAR } from "../../utils";

@nearBindgen
export class Contract {
  private owner: string = "";

  constructor(owner: string) {
    this.owner = owner
  }

  @mutateState()
  setOwner(owner: string): string {
    assert(this.owner.length === 0, "Owner already setup")
    this.owner = owner
    return `Owner set to ${owner} succesfully!`
  }

  @mutateState()
  changeOwner(newOwner: string): string {
    assert(context.sender != this.owner, "Only owner can change owner")
    this.owner = newOwner
    return `New owner is ${newOwner}`
  }

  contractStatus(): string {
    return `Owner: ${this.owner}`;
  }

  createGame(): u32 {
    assert(
      context.attachedDeposit == ONE_NEAR,
      "You need to send only 1 near token"
    );
    const game = new Memonear();
    games.set(game.gameId, game);
    game.gameDeposit = context.attachedDeposit;

    return game.gameId;
  }

  getGameInfo(gameId: u32): Memonear {
    assert(context.sender == this.owner, "Only owner can call this function");
    let game = games.getSome(gameId);
    return game;
  }

  showBoard(gameId: u32): Array<string[]> {
    assert(context.sender == this.owner, "Only owner can call this function");
    let game = games.getSome(gameId);
    return game.gameBoard;
  }

  checkCombination(gameId: u32, x1: u32, y1: u32, x2: u32, y2: u32): string {
    let game = games.getSome(gameId);

    let firstItem: string = game.gameBoard[x1][y1];
    let secondItem: string = game.gameBoard[x2][y2];
    game.userPlays += 1;

    if (firstItem == secondItem) {
      game.matchCount += 1;
      game.gameBoard[x1][y1] = "winned.png";
      game.gameBoard[x2][y2] = "winned.png";

      if (game.matchCount == 6) {
        return this.endGame(game, game.userPlays <= 8);
      }

      games.set(gameId, game);
      return "Its a match";
    }
    games.set(gameId, game);

    return "Sorry, try again";
  }

  mockGame(gameId: u32, userPlays: u32): void {
    assert(context.sender == this.owner, "Only owner can call this function");
    let game = games.getSome(gameId);

    game.gameBoard = [
      ["slime_pink.png", "slime_pink.png", "winned.png", "winned.png"],
      ["winned.png", "winned.png", "winned.png", "winned.png"],
      ["winned.png", "winned.png", "winned.png", "winned.png"],
    ];

    game.matchCount = 5;
    game.userPlays = userPlays;

    games.set(gameId, game);
  }

  endGame(game: Memonear, returnAll: bool): string {
    game.gameState = State.Finished;
    const payablePromise = ContractPromiseBatch.create(game.player);
    let winnerTokens: u128 = game.gameDeposit;

    if (!returnAll) {
      winnerTokens = u128.div(game.gameDeposit, u128.from("2"));
    }

    payablePromise.transfer(winnerTokens);

    games.set(game.gameId, game);
    return `Player ${game.player} won! and has received ${winnerTokens} tokens!`;
  }

  printBoard(gameId: u32): string {
    let game = games.getSome(gameId);

    var parsedBoard = "";

    for (let i = 0; i < game.gameBoard.length; i++) {
      for (let j = 0; j < game.gameBoard[i].length; j++) {
        if (game.gameBoard[i][j] == "winned.png") {
          parsedBoard = parsedBoard.concat(game.gameBoard[i][j] + " | ");
        } else {
          parsedBoard = parsedBoard.concat("hidden.png | ");
        }
        
      }
      parsedBoard = parsedBoard.concat("\n");

    }

    return parsedBoard;
  }
}
