import * as Types from "@/game/Game.types";
import getFreeTileId from "@/game/utils/getFreeTileId";

type InternalState = {
  hasActed: boolean;
};

const supportedActions: Types.Action[] = [
  "up",
  "down",
  "left",
  "right",
  "tap",
  "tick",
];

const heroColor = "white";
const enemyColor = "red";

const getInitState: Types.GetInitState = ({ rand, gridSize, settings }) => {
  let state: Types.GameState | null = {
    tiles: [],
    score: 0,
    status: "user-turn",
    settings,
    exitLocations: [],
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
  action,
  gridSize,
}: {
  state: Types.GameState;
  action: Types.Action;
  gridSize: Types.GridSize;
}): Types.Position | null {
  const heroPosition = getHeroPosition(state);

  const nextPosition: Types.Position = [...heroPosition];
  switch (action) {
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
      return null;
  }

  // Check if the next position is within the grid bounds
  if (
    nextPosition[0] < 0 ||
    nextPosition[0] >= gridSize.rows ||
    nextPosition[1] < 0 ||
    nextPosition[1] >= gridSize.columns
  ) {
    return null; // No move
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

  const heroValue =
    heroTile.value === null || enemyTile.value === null
      ? heroTile.value
      : heroTile.value - enemyTile.value;

  const enemyValue =
    heroTile.value === null || enemyTile.value === null
      ? enemyTile.value
      : enemyTile.value - heroTile.value;

  const scoreChange = heroValue !== null ? Math.max(heroValue, 0) * 10 : 0;

  state.tiles.forEach((tile) => {
    if (tileType(tile) === "hero") {
      if (heroValue !== null && heroValue > 0) {
        tiles.push({
          ...tile,
          position: position,
          value: heroValue,
          mergedFrom: [enemyTile.id],
        });
      }
    } else {
      if (enemyTile.id === tile.id) {
        if (enemyValue !== null && enemyValue > 0) {
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
    return { ...state, status: "lost" }; // No hero left, game lost
  }

  if (enemyTiles.length === 0) {
    return { ...state, status: "won" }; // No enemies left, game won
  }

  return state; // Game continues
}

type Damage = {
  position: Types.Position;
  value: number;
  target: "hero" | "enemy" | "all";
};

function damageTileId({
  state,
  tileId,
  value,
}: {
  state: Types.GameState;
  tileId: Types.TileId;
  value: number;
}): Types.GameState {
  const tiles: Types.Tile[] = [];

  state.tiles.forEach((tile) => {
    if (tile.id === tileId) {
      const newValue = tile.value === null ? null : tile.value - value;

      if (newValue !== null && newValue > 0) {
        tiles.push({ ...tile, value: newValue });
      }
    } else {
      tiles.push(tile);
    }
  });

  return {
    ...state,
    tiles,
  };
}

function dealDamage({
  damage,
  state,
}: {
  state: Types.GameState;
  damage: Damage[];
}): Types.GameState {
  let nextState: Types.GameState = { ...state };

  damage.forEach(({ position, value, target }) => {
    const tile = getTileAtPosition({ state: nextState, position });

    if (!tile) {
      return; // No tile at the specified position
    }

    if (target === "hero" && tileType(tile) === "hero") {
      nextState = damageTileId({
        state: nextState,
        tileId: tile.id,
        value,
      });
    } else if (target === "enemy" && tileType(tile) === "enemy") {
      nextState = damageTileId({
        state: nextState,
        tileId: tile.id,
        value,
      });
    } else if (target === "all") {
      nextState = damageTileId({
        state: nextState,
        tileId: tile.id,
        value,
      });
    }
  });

  return nextState;
}

// Deals 1 damage to all adjacent enemies to the hero (orthogonal only)
function resolveTapAction(
  state: Types.GameState,
  internalState: InternalState
): Types.GameState {
  const damageValue = 1;
  internalState.hasActed = true;

  const heroTile = getHeroTile(state);
  const heroPosition = heroTile.position;

  const adjacentPositions: Types.Position[] = [
    [heroPosition[0] - 1, heroPosition[1]], // Up
    [heroPosition[0] + 1, heroPosition[1]], // Down
    [heroPosition[0], heroPosition[1] - 1], // Left
    [heroPosition[0], heroPosition[1] + 1], // Right
  ];

  const damage: Damage[] = adjacentPositions.map((position) => ({
    position,
    value: damageValue,
    target: "enemy", // Target only enemies
  }));

  return dealDamage({
    state,
    damage,
  });
}

function resolveTurn({
  state,
  internalState,
}: {
  state: Types.GameState;
  internalState: InternalState;
}): Types.GameState {
  if (state.status === "ai-turn") {
    return {
      ...state,
      status: "user-turn",
    };
  }

  if (state.status === "user-turn" && internalState.hasActed) {
    return {
      ...state,
      status: "ai-turn",
    };
  }

  return state; // No change in status
}

// Move all enemies 1 adjacent place orthogonally towards the hero. If the enemy is in the same
// position as the hero, resolve a collision, if there is an choice of direction, choose a random
// one. Do not move the hero
function resolveTick(
  state: Types.GameState,
  rand: Types.Rand,
  gridSize: Types.GridSize
): Types.GameState {
  const heroPosition = getHeroPosition(state);
  let newState = { ...state };

  const enemyTiles = state.tiles.filter((tile) => tileType(tile) === "enemy");

  for (const enemy of enemyTiles) {
    const [erow, ecol] = enemy.position;
    const [hrow, hcol] = heroPosition;

    const possibleMoves: Types.Position[] = [];

    if (erow > 0 && erow > hrow) possibleMoves.push([erow - 1, ecol]); // up
    if (erow < gridSize.rows - 1 && erow < hrow)
      possibleMoves.push([erow + 1, ecol]); // down
    if (ecol > 0 && ecol > hcol) possibleMoves.push([erow, ecol - 1]); // left
    if (ecol < gridSize.columns - 1 && ecol < hcol)
      possibleMoves.push([erow, ecol + 1]); // right

    const moveTo = possibleMoves.find((pos) => {
      const occupiedTile = getTileAtPosition({
        state: newState,
        position: pos,
      });
      return !occupiedTile || tileType(occupiedTile) === "hero";
    });

    if (!moveTo) continue;

    const tileAtDest = getTileAtPosition({ state: newState, position: moveTo });

    if (tileAtDest && tileType(tileAtDest) === "hero") {
      newState = resolveHeroEnemyCollision({
        state: newState,
        position: moveTo,
        enemyTile: enemy,
      });
    } else {
      // Move enemy
      newState = {
        ...newState,
        tiles: newState.tiles.map((tile) =>
          tile.id === enemy.id ? { ...tile, position: moveTo } : tile
        ),
      };
    }
  }

  return newState;
}

const applyAction: Types.ApplyAction = ({ state, action, gridSize, rand }) => {
  if (!supportedActions.includes(action)) {
    return state; // Invalid action, return current state
  }

  const internalState: InternalState = {
    hasActed: false,
  };
  let nextState: Types.GameState = { ...state };

  if (action === "tap") {
    nextState = resolveTapAction(nextState, internalState);
  }

  if (action === "tick") {
    internalState.hasActed = true;
    nextState = resolveTick(nextState, rand, gridSize);
  }

  const nextHeroPosition = getNextHeroPosition({
    state,
    action,
    gridSize,
  });

  if (nextHeroPosition) {
    internalState.hasActed = true;

    const tileAtNextPosition = getTileAtPosition({
      state,
      position: nextHeroPosition,
    });

    if (!tileAtNextPosition) {
      // console.log("Moving hero to empty position: ", nextHeroPosition);
      nextState = moveHeroToPosition(state, nextHeroPosition);
    } else {
      // console.log("Collide!", nextHeroPosition);
      nextState = resolveHeroEnemyCollision({
        state,
        position: nextHeroPosition,
        enemyTile: tileAtNextPosition,
      });
    }
  }

  nextState = resolveEndState(nextState);

  nextState = resolveTurn({
    state: nextState,
    internalState,
  });

  return nextState;
};

const gameConfig: Types.GameConfig = {
  supportedActions,
  name: "Number Rogue",
  getInitState,
  applyAction,
  defaultGridSize: {
    rows: 5,
    columns: 5,
  },
  defaultSettings: {
    zeroTiles: false,
    permZeroTileCount: 2,
    randomFixedTiles: null,
    newTileValue: 2,
  },
};

export default gameConfig;
