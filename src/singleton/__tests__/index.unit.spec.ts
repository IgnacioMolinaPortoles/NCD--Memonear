import { context, logging, u128, VMContext } from "near-sdk-as";
import { ONE_NEAR } from "../../utils";
import { Contract } from "../assembly";
import { State } from "../assembly/models";

let contract: Contract;

beforeEach(() => {
  contract = new Contract(context.sender);
});

describe("Memonear contract test", () => {
  // VIEW method tests

  it("Contract created correctly", () => {
    expect(contract).not.toBeNull();
  });

  it("Owner should the user who created the contract", () => {
    expect(contract.contractStatus()).toStrictEqual(`Owner: ${context.sender}`);
  });

  it("Mock function should be only calleable by owner", () => {
    VMContext.setAttached_deposit(ONE_NEAR);

    expect(() => {
      let gameId = contract.createGame();
      VMContext.setSigner_account_id("selvatico.testnet");
      contract.mockGame(gameId, 7);
    }).toThrow();
  });

  it("Creating a game sending 1 $NEAR", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    expect<u32>(contract.createGame()).toBeGreaterThan(0);
  });

  it("When a game is created, the state should be in progress", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    let gameId = contract.createGame();
    let data = contract.getGameInfo(gameId);
    expect<State>(data.gameState).toBe(State.InProgress);
  });

  it("When a game is created, it should have 0 plays", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    let gameId = contract.createGame();
    let data = contract.getGameInfo(gameId);
    expect<u32>(data.userPlays).toBe(0);
  });

  it("Board should have 6 unique items", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    let gameId = contract.createGame();
    let board = contract.showBoard(gameId);
    let items: Array<string> = [];

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (!items.includes(board[i][j])) {
          items.push(board[i][j]);
        }
      }
    }

    expect(items).toHaveLength(6);
  });

  it("Should return its a match correctly", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    let gameId = contract.createGame();
    let board = contract.showBoard(gameId);
    let firstItem = board[0][0];

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (firstItem === board[i][j]) {
          let res = contract.checkCombination(gameId, 0, 0, i, j);
          expect(res).toStrictEqual("Its a match");
        }
      }
    }
  });

  it("Play should increase the play count", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    let gameId = contract.createGame();
    contract.checkCombination(gameId, 0, 0, 1, 1);

    let gameInfo = contract.getGameInfo(gameId);
    expect(gameInfo.userPlays).toBe(1);
  });

  it("If its a match, match count should increase", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    let gameId = contract.createGame();
    let board = contract.showBoard(gameId);
    let firstItem = board[0][0];

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (firstItem === board[i][j]) {
          contract.checkCombination(gameId, 0, 0, i, j);
          let gameInfo = contract.getGameInfo(gameId);
          expect(gameInfo.matchCount).toBe(1);
        }
      }
    }
  });

  it("When 2 items are matched, items should become winned.png", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    let gameId = contract.createGame();
    let board = contract.showBoard(gameId);
    let firstItem = board[0][0];

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (firstItem === board[i][j]) {
          contract.checkCombination(gameId, 0, 0, i, j);
          let newBoard = contract.showBoard(gameId);

          expect(newBoard[0][0]).toStrictEqual("winned.png");
          expect(newBoard[i][j]).toStrictEqual("winned.png");
        }
      }
    }
  });

  it("When match all items and play count is under 8, game should be finished and player receive 1 $NEAR", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    let gameId = contract.createGame();
    contract.mockGame(gameId, 7);

    let res = contract.checkCombination(gameId, 0, 0, 0, 1);
    expect(res).toBe(`Player ${context.sender} won! and has received ${ONE_NEAR} tokens!`);
  });

  it("When match all items and play count is over 8, game should be finished and player receive 0.5 $NEAR", () => {
    VMContext.setAttached_deposit(ONE_NEAR);
    let gameId = contract.createGame();
    contract.mockGame(gameId, 8);

    let res = contract.checkCombination(gameId, 0, 0, 0, 1);
    const HALF_NEAR = u128.from("500000000000000000000000");
    expect(res).toBe(`Player ${context.sender} won! and has received ${HALF_NEAR} tokens!`);
  });
});
