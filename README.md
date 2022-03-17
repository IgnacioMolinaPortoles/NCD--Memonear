# NCD Project Memonear 

Video demo: [here](https://drive.google.com/file/d/1L0licLk5sSTQ21iwIp3QHHPRhX8hhfC3/view)

Figma wireframes: [here](https://www.figma.com/file/reMNlA1lKaM1hFthWbwvrP/Untitled?node-id=3%3A117)

## Install dependencies
```
yarn
```

## Build and Deploy the contract
```
yarn build

near dev-deploy ./build/debug/singleton.wasm

# Copy the contract name and export it like this

export CONTRACT=<dev-123-456>
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

near call <contract-id> createGame --account_id <account-id> --amount 1
```

**View board for the first time**
```
near call <contract-id> printBoard '{"gameId": <game-id>}' --account_id <account-id>
```

**Start matching items**
```
near call <contract-id> checkCombination '{"gameId": <game-id>, "x1": <x-first-item>, "y1":<y-first-item>, "x2":<x-second-item>, "y2":<y-second-item>}' --accountId <account-id>
```

## Owner functions

**Get game info (playerId, Game state, Game deposit, Game board, Match count and User tries)**
```
near call <contract-id> getGameInfo '{"gameId": <game-id>}' --account_id <account-id>
```
**Hardcode game board to have only 2 items left to match**
```
near call <contract-id> mockGame '{"gameId": <game-id>, "userPlays": <amount-of-tries>}' --account_id <account-id>
```