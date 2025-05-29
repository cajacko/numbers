import * as Types from "@/game/Game.types";
import spawnTile from "@/game/utils/spawnTile";
import createPositionMap from "@/game/utils/createPositionMap";
import getAvailablePositions from "@/game/utils/getAvailablePositions";
import getFreeTileId from "@/game/utils/getFreeTileId";

const heroColor = "white";
const enemyColor = "red";

const getInitState: Types.GetInitState = ({ rand, gridSize }) => {
  let state: Types.GameState | null = {
    tiles: [],
    score: 0,
    state: "playing",
  };

  state = {
    ...state,
    tiles: [
      ...state.tiles,
      {
        backgroundColor: heroColor,
        textColor: "black",
        id: getFreeTileId(state),
        position: [3, 1],
        value: 5,
        mergedFrom: null,
      },
    ],
  };

  state = {
    ...state,
    tiles: [
      ...state.tiles,
      {
        backgroundColor: enemyColor,
        textColor: "black",
        id: getFreeTileId(state),
        position: [0, 2],
        value: 2,
        mergedFrom: null,
      },
    ],
  };

  state = {
    ...state,
    tiles: [
      ...state.tiles,
      {
        backgroundColor: enemyColor,
        textColor: "black",
        id: getFreeTileId(state),
        position: [1, 0],
        value: 2,
        mergedFrom: null,
      },
    ],
  };

  return state;
};

function getHeroPosition(state: Types.GameState): Types.Position {
  const heroTile = state.tiles.find(
    (tile) => tile.backgroundColor === heroColor
  );

  if (!heroTile) {
    throw new Error("Hero tile not found in the game state.");
  }

  return heroTile.position;
}

// Returns the next hero position based on the direction as long as it is a valid position on the
// grid. We don't care about other tiles at this stage
function getNextHeroPosition({
  state,
  direction,
  gridSize,
}: {
  state: Types.GameState;
  direction: Types.Direction;
  gridSize: Types.GridSize;
}): Types.Position | null {
  const heroPosition = getHeroPosition(state);

  const nextPosition: Types.Position = [...heroPosition];
  switch (direction) {
    case "up":
      nextPosition[0] -= 1;
      break;
    case "down":
      nextPosition[0] += 1;
      break;
    case "left":
      nextPosition[1] -= 1;
      break;
    case "right":
      nextPosition[1] += 1;
      break;
    default:
      throw new Error(`Invalid direction: ${direction}`);
  }

  // Check if the next position is within the grid bounds
  if (
    nextPosition[0] < 0 ||
    nextPosition[0] >= gridSize.rows ||
    nextPosition[1] < 0 ||
    nextPosition[1] >= gridSize.columns
  ) {
    return null; // Invalid position
  }

  return nextPosition;
}

function getTileAtPosition({
  state,
  position,
}: {
  state: Types.GameState;
  position: Types.Position;
}): Types.Tile | null {
  const tile = state.tiles.find(
    (tile) =>
      tile.position[0] === position[0] && tile.position[1] === position[1]
  );

  if (!tile) {
    return null; // No tile at the specified position
  }

  return tile;
}

function getHeroTile(state: Types.GameState): Types.Tile {
  const heroTile = state.tiles.find(
    (tile) => tile.backgroundColor === heroColor
  );
  if (!heroTile) {
    throw new Error("Hero tile not found in the game state.");
  }
  return heroTile;
}

function moveHeroToPosition(
  state: Types.GameState,
  position: Types.Position
): Types.GameState {
  const heroTile = getHeroTile(state);

  // Create a new tile with the same properties but at the new position
  const newHeroTile: Types.Tile = {
    ...heroTile,
    position: position,
  };

  // Replace the old hero tile with the new one
  const updatedTiles = state.tiles.map((tile) =>
    tile.id === heroTile.id ? newHeroTile : tile
  );

  return {
    ...state,
    tiles: updatedTiles,
  };
}

function tileType(tile: Types.Tile): "hero" | "enemy" {
  if (tile.backgroundColor === heroColor) {
    return "hero";
  } else if (tile.backgroundColor === enemyColor) {
    return "enemy";
  } else {
    throw new Error("Unknown tile type");
  }
}

function resolveHeroEnemyCollision({
  enemyTile,
  position,
  state,
}: {
  state: Types.GameState;
  position: Types.Position;
  enemyTile: Types.Tile;
}): Types.GameState {
  const tiles: Types.Tile[] = [];
  const heroTile = getHeroTile(state);

  const heroValue = heroTile.value - enemyTile.value;
  const enemyValue = enemyTile.value - heroTile.value;

  const scoreChange = Math.max(heroTile.value - enemyTile.value, 0) * 10;

  state.tiles.forEach((tile) => {
    if (tileType(tile) === "hero") {
      if (heroValue > 0) {
        tiles.push({
          ...tile,
          position: position,
          value: heroValue,
          mergedFrom: [enemyTile.id],
        });
      }
    } else {
      if (enemyTile.id === tile.id) {
        if (enemyValue > 0) {
          tiles.push({
            ...tile,
            position: enemyTile.position,
            value: enemyValue,
            mergedFrom: [heroTile.id],
          });
        }
      } else {
        tiles.push(tile);
      }
    }
  });

  return {
    ...state,
    score: state.score + scoreChange,
    tiles,
  };
}

// if no enemies then win, if no heroes then lose, otherwise keep playing
function resolveEndState(state: Types.GameState): Types.GameState {
  const heroTile = state.tiles.find(
    (tile) => tile.backgroundColor === heroColor
  );

  const enemyTiles = state.tiles.filter(
    (tile) => tile.backgroundColor === enemyColor
  );

  if (!heroTile) {
    return { ...state, state: "lost" }; // No hero left, game lost
  }

  if (enemyTiles.length === 0) {
    return { ...state, state: "won" }; // No enemies left, game won
  }

  return state; // Game continues
}

const applyMove: Types.ApplyMove = ({ state, direction, gridSize, rand }) => {
  let nextState: Types.GameState = { ...state };

  const nextHeroPosition = getNextHeroPosition({
    state,
    direction,
    gridSize,
  });

  if (nextHeroPosition) {
    const tileAtNextPosition = getTileAtPosition({
      state,
      position: nextHeroPosition,
    });

    if (!tileAtNextPosition) {
      console.log("Moving hero to empty position: ", nextHeroPosition);
      nextState = moveHeroToPosition(state, nextHeroPosition);
    } else {
      console.log("Collide!", nextHeroPosition);
      nextState = resolveHeroEnemyCollision({
        state,
        position: nextHeroPosition,
        enemyTile: tileAtNextPosition,
      });
    }
  } else {
    console.log("Invalid move, hero cannot move in that direction.", direction);
  }

  nextState = resolveEndState(nextState);

  return nextState;
};

const gameConfig: Types.GameConfig = {
  name: "2048",
  getInitState,
  applyMove,
  defaultGridSize: {
    rows: 4,
    columns: 4,
  },
};

export default gameConfig;
