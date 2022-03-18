# NCD Project Memonear 

🎬 [Loom demo](https://www.loom.com/share/6f72b278a5fa4dbe8ba460a530bb06a7)

🎨 [Figma design](https://www.figma.com/file/CysKjUzYeDr2qUTBw5UohU/Memonear?node-id=0%3A1)

## Install dependencies
```
yarn
```

## Build and Deploy the contract
```
yarn build

near dev-deploy ./build/debug/singleton.wasm

# Save the contract dev name (<dev-123-456>)
```

## Guide

1. You need to create a new game with `createGame` function and send 1 near tokens
2. Player can start playing by checking different combinations, sending the position (x, y) to `checkCombination` of the 2 items to match
5. The player need to match all 6 items to win
4. The player can view the board at any moment by using `printBoard(gameId)` 
6. If some player doesnt want to play anymore, the owner can call `mockGame` and finish the game
7. When 6 items are matched, the attached deposit when the game was created will be transfered to the wallet of the winner if the player complete the game in less than 8 plays, otherwise it will receive 0.5 near tokens.

## Run the game
**Create a game**
```
# Save the game id to play

near call <dev-123-456> createGame --account_id <account-id> --amount 1
```

**View board for the first time**
```
near call <dev-123-456> printBoard '{"gameId": <game-id>}' --account_id <account-id>
```

**Start matching items**
```
near call <dev-123-456> checkCombination '{"gameId": <game-id>, "x1": <x-first-item>, "y1":<y-first-item>, "x2":<x-second-item>, "y2":<y-second-item>}' --accountId <account-id>
```

## Owner functions

**Get game info (playerId, Game state, Game deposit, Game board, Match count and User tries)**
```
near call <dev-123-456> getGameInfo '{"gameId": <game-id>}' --account_id <account-id>
```
**Hardcode game board to have only 2 items left to match**
```
near call <dev-123-456> mockGame '{"gameId": <game-id>, "userPlays": <amount-of-tries>}' --account_id <account-id>
```
