import * as Types from "@/game/Game.types";
import spawnTile from "@/game/utils/spawnTile";
import createPositionMap from "@/game/utils/createPositionMap";
import getAvailablePositions from "@/game/utils/getAvailablePositions";
import withRand from "@/utils/withRand";
import getLevelSettings from "@/game/utils/getLevelSettings";

const sides: Types.ExitLocation["side"][] = ["top", "bottom", "left", "right"];
const defaultNewTileValue = 1;

function generateExitLocations(
  rand: Types.Rand,
  gridSize: Types.GridSize,
  value: number
): Types.Goal[] {
  const side = rand(sides);

  const maxIndex =
    side === "top" || side === "bottom"
      ? gridSize.columns - 1
      : gridSize.rows - 1;

  const index = Math.floor(rand() * maxIndex);

  return [
    {
      type: "exit-location",
      payload: {
        side,
        index,
        requirements: {
          type: "greater-than-equal-to",
          value,
        },
      },
    },
  ];
}

function getLevels(rand: Types.Rand): Types.Settings[] {
  return [
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 16),
      gridSize: { rows: 4, columns: 4 },
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 32),
      gridSize: { rows: 4, columns: 4 },
      permZeroTileCount: 1,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 64),
      gridSize: { rows: 4, columns: 4 },
      permZeroTileCount: 2,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 128),
      gridSize: { rows: 4, columns: 4 },
      randomFixedTiles: 1,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 256),
      gridSize: { rows: 5, columns: 4 },
      randomFixedTiles: 2,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 512),
      gridSize: { rows: 5, columns: 4 },
      permZeroTileCount: 0,
      randomFixedTiles: 1,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 1024),
      gridSize: { rows: 5, columns: 4 },
      permZeroTileCount: 2,
      randomFixedTiles: 1,
    },
    {
      goals: generateExitLocations(rand, { rows: 4, columns: 4 }, 2048),
      gridSize: { rows: 6, columns: 4 },
      permZeroTileCount: 2,
      randomFixedTiles: 2,
    },
  ];
}

function resolveNewLevel({
  exitedTiles,
  rand,
  state,
  level,
}: {
  state: Types.GameState;
  rand: Types.Rand;
  exitedTiles: Types.Tile[];
  level: number;
}): Types.GameState {
  let nextState: Types.GameState = {
    seed: state.seed,
    tiles: [],
    score: state.score,
    status: "user-turn",
    level,
    levelSettings: state.levelSettings,
    turn: 1,
  };

  const settings = getLevelSettings(nextState);

  const tiles = exitedTiles.map((tile, i) => ({
    ...tile,
    mergedFrom: null,
    // id: i, // NOTE: Keep the same ID, it's the same tile, so it makes sense. The animation
    // layer should handle the transition
    position: exitedTileToNewTilePosition(tile, settings.gridSize),
  }));

  nextState.tiles = tiles;

  if (settings.randomFixedTiles) {
    nextState = spawnTiles({
      state: nextState,
      rand,
      count: settings.randomFixedTiles,
      value: null,
    });
  }

  if (settings.permZeroTileCount) {
    nextState = spawnTiles({
      state: nextState,
      rand,
      count: settings.permZeroTileCount,
      value: 0,
    });
  }

  nextState = spawnTiles({
    state: nextState,
    rand,
    count: 2,
    value: settings.newTileValue ?? defaultNewTileValue,
  });

  return nextState;
}

const getInitState = ({
  rand,
  seed,
}: {
  rand: Types.Rand;
  seed: string;
}): Types.GameState => {
  const levelSettings = getLevels(rand);

  let nextState: Types.GameState = {
    tiles: [],
    score: 0,
    status: "user-turn",
    levelSettings,
    level: 1,
    seed,
    turn: 1,
  };

  return resolveNewLevel({
    state: nextState,
    rand,
    exitedTiles: [],
    level: 1,
  });
};

const supportedActions: Types.Action[] = ["up", "down", "left", "right"];

export function getColorsFromValue(value: Types.Value): {
  backgroundColor: string;
  textColor: string;
} {
  switch (value) {
    case null:
      return { backgroundColor: "black", textColor: "black" };
    case 0:
      return { backgroundColor: "#eee4da", textColor: "#776e65" };
    case 1:
      return { backgroundColor: "#ede0c8", textColor: "#776e65" };
    case 2:
      return { backgroundColor: "#f2b179", textColor: "#f9f6f2" };
    case 4:
      return { backgroundColor: "#f59563", textColor: "#f9f6f2" };
    case 8:
      return { backgroundColor: "#f67c5f", textColor: "#f9f6f2" };
    case 16:
      return { backgroundColor: "#f65e3b", textColor: "#f9f6f2" };
    case 32:
      return { backgroundColor: "#edcf72", textColor: "#f9f6f2" };
    case 64:
      return { backgroundColor: "#edcc61", textColor: "#f9f6f2" };
    case 128:
      return { backgroundColor: "#edc850", textColor: "#f9f6f2" };
    case 256:
      return { backgroundColor: "#edc53d", textColor: "#f9f6f2" };
    case 512:
      return { backgroundColor: "#edc22e", textColor: "#f9f6f2" };
    case 1024:
      return { backgroundColor: "#edc22e", textColor: "#f9f6f2" };
    case 2048:
      return { backgroundColor: "#edc22e", textColor: "#f9f6f2" };
    default:
      return { backgroundColor: "#cdc1b4", textColor: "#776e65" };
  }
}

function spawnTiles({
  state,
  rand,
  count,
  value,
}: {
  state: Types.GameState;
  rand: Types.Rand;
  count: number;
  value: Types.Value;
}): Types.GameState {
  let nextState: Types.GameState | null = state;

  for (let i = 0; i < count; i++) {
    nextState = spawnTile({
      rand,
      state: nextState,
      tile: {
        value: value,
        ...getColorsFromValue(value),
      },
    });

    if (!nextState) {
      throw new Error("No available position to place a new tile.");
    }
  }

  return nextState;
}

function mergeTiles(
  target: Types.Tile,
  source: Types.Tile,
  removed: Set<Types.TileId>
): { score: number | null; changed: boolean } {
  // Fixed tiles (value === null) should never merge. Guard against it here.
  if (target.value === null || source.value === null) {
    return { score: null, changed: false };
  }

  removed.add(source.id);

  target.value += source.value;

  const colors = getColorsFromValue(target.value);
  target.backgroundColor = colors.backgroundColor;
  target.textColor = colors.textColor;
  target.mergedFrom = [target.id, source.id];

  const changed =
    source.position[0] !== target.position[0] ||
    source.position[1] !== target.position[1];

  return { score: target.value, changed };
}

function moveTile(tile: Types.Tile, row: number, column: number): boolean {
  if (tile.position[0] !== row || tile.position[1] !== column) {
    tile.position = [row, column];
    return true;
  }
  return false;
}

function slideColumn(
  columnTiles: Types.Tile[],
  col: number,
  targetRow: number,
  step: number,
  removed: Set<Types.TileId>
): { score: number; changed: boolean } {
  let lastTile: Types.Tile | null = null;
  let changed = false;
  let score = 0;

  columnTiles.forEach((tile) => {
    if (tile.value === null) {
      // Fixed tile acts as a wall
      lastTile = null;
      targetRow = tile.position[0] + step;
      return;
    }

    if (lastTile && lastTile.value === tile.value && !lastTile.mergedFrom) {
      const result = mergeTiles(lastTile, tile, removed);

      if (result.score) {
        score += result.score;
      }
      if (result.changed) changed = true;
    } else {
      if (moveTile(tile, targetRow, col)) changed = true;
      lastTile = tile;
      targetRow += step;
    }
  });

  return { score, changed };
}

function slideRow(
  rowTiles: Types.Tile[],
  row: number,
  targetCol: number,
  step: number,
  removed: Set<Types.TileId>
): { score: number; changed: boolean } {
  let lastTile: Types.Tile | null = null;
  let changed = false;
  let score = 0;

  rowTiles.forEach((tile) => {
    if (tile.value === null) {
      // Fixed tile acts as a wall
      lastTile = null;
      targetCol = tile.position[1] + step;
      return;
    }

    if (lastTile && lastTile.value === tile.value && !lastTile.mergedFrom) {
      const result = mergeTiles(lastTile, tile, removed);
      if (result.score) {
        score += result.score;
      }
      if (result.changed) changed = true;
    } else {
      if (moveTile(tile, row, targetCol)) changed = true;
      lastTile = tile;
      targetCol += step;
    }
  });

  return { score, changed };
}

function slideTiles(
  tiles: Types.Tile[],
  action: Types.Action,
  gridSize: Types.GridSize
) {
  const working: Types.Tile[] = tiles.map((t) => ({ ...t, mergedFrom: null }));
  const positionMap = createPositionMap(working);
  const removed = new Set<Types.TileId>();
  let scoreIncrease = 0;
  let changed = false;

  const { rows, columns } = gridSize;

  if (action === "up" || action === "down") {
    const start = action === "up" ? 0 : rows - 1;
    const end = action === "up" ? rows : -1;
    const step = action === "up" ? 1 : -1;

    for (let col = 0; col < columns; col++) {
      const columnTiles: Types.Tile[] = [];
      for (let r = start; r !== end; r += step) {
        const tile = positionMap[r]?.[col];
        if (tile) columnTiles.push(tile);
      }

      const result = slideColumn(columnTiles, col, start, step, removed);

      scoreIncrease += result.score;
      if (result.changed) changed = true;
    }
  } else {
    const start = action === "left" ? 0 : columns - 1;
    const end = action === "left" ? columns : -1;
    const step = action === "left" ? 1 : -1;

    for (let row = 0; row < rows; row++) {
      const rowTiles: Types.Tile[] = [];
      for (let c = start; c !== end; c += step) {
        const tile = positionMap[row]?.[c];
        if (tile) rowTiles.push(tile);
      }

      const result = slideRow(rowTiles, row, start, step, removed);

      scoreIncrease += result.score;
      if (result.changed) changed = true;
    }
  }

  const newTiles = working.filter((t) => !removed.has(t.id));
  return { tiles: newTiles, scoreIncrease, changed };
}

function requirementsMet(
  value: Types.Value,
  requirements: Types.ExitLocation["requirements"]
): boolean {
  if (value === null) return false;
  switch (requirements.type) {
    case "greater-than-equal-to":
      return value >= requirements.value;
    case "equal-to":
      return value === requirements.value;
    default:
      return false;
  }
}

const actionToExitLocationSide: Record<
  Types.Action,
  Types.ExitLocation["side"] | null
> = {
  up: "top",
  down: "bottom",
  left: "left",
  right: "right",
  tap: null,
  tick: null,
};

function applyExitLocations(
  state: Types.GameState,
  gridSize: Types.GridSize,
  action: Types.Action
): { changed: boolean } {
  let changed = false;

  const goals = getLevelSettings(state).goals;

  for (const exit of goals) {
    if (exit.type !== "exit-location") continue;

    let row: number;
    let col: number;
    let newRow: number;
    let newCol: number;

    switch (exit.payload.side) {
      case "top":
        row = 0;
        col = exit.payload.index;
        newRow = -1;
        newCol = col;
        break;
      case "bottom":
        row = gridSize.rows - 1;
        col = exit.payload.index;
        newRow = gridSize.rows;
        newCol = col;
        break;
      case "left":
        row = exit.payload.index;
        col = 0;
        newRow = row;
        newCol = -1;
        break;
      case "right":
        row = exit.payload.index;
        col = gridSize.columns - 1;
        newRow = row;
        newCol = gridSize.columns;
        break;
    }

    const tile = state.tiles.find(
      (t) => t.position[0] === row && t.position[1] === col
    );
    if (
      tile &&
      !tile.mergedFrom &&
      requirementsMet(tile.value, exit.payload.requirements) &&
      actionToExitLocationSide[action] === exit.payload.side
    ) {
      if (moveTile(tile, newRow, newCol)) changed = true;
    }
  }

  return { changed };
}

function spawnRandomTile(
  state: Types.GameState,
  rand: Types.Rand,
  changed: boolean
): Types.GameState {
  if (!changed) return state;

  let nextState = state;

  const zeroCount = state.tiles.filter((t) => t.value === 0).length;

  const settings = getLevelSettings(state);

  let value: number | null;

  if (settings.permZeroTileCount && zeroCount < settings.permZeroTileCount) {
    value = 0;
  } else {
    value = settings.newTileValue ?? defaultNewTileValue;
  }

  nextState =
    spawnTile({
      state,
      rand,
      tile: { value, ...getColorsFromValue(value) },
    }) ?? nextState;

  return nextState;
}

/**
 * 2x2 = 16
 * 4x4 = 2048
 * ...
 */
function getGoalFromGridSize(gridSize: Types.GridSize): number {
  const { rows, columns } = gridSize;

  const tiles = rows * columns;

  switch (tiles) {
    case 4: // 2x2
      return 16; // Goal for 2x2 grid
    default:
    case 16: // 4x4
      return 2048;
  }
}

/**
 * When a tile exits the grid, it should re-enter from the opposite side.
 * For example, if a tile exits from the top, it should re-enter from the bottom. and be adjacent to
 * the bottom edge and in the same column.
 */
function exitedTileToNewTilePosition(
  tile: Types.Tile,
  gridSize: Types.GridSize
): Types.Position {
  const [row, column] = tile.position;
  const { rows, columns } = gridSize;

  if (row < 0) {
    // Exited from top
    return [rows - 1, column];
  } else if (row >= rows) {
    // Exited from bottom
    return [0, column];
  } else if (column < 0) {
    // Exited from left
    return [row, columns - 1];
  } else if (column >= columns) {
    // Exited from right
    return [row, 0];
  }

  throw new Error(`Tile at position ${tile.position} did not exit the grid.`);
}

function resolveEndState(
  state: Types.GameState,
  rand: Types.Rand
): Types.GameState {
  const settings = getLevelSettings(state);

  const { rows, columns } = settings.gridSize;
  const lastLevel = state.levelSettings.length;

  const exitedTiles = state.tiles.filter(
    (t) =>
      t.position[0] < 0 ||
      t.position[0] >= rows ||
      t.position[1] < 0 ||
      t.position[1] >= columns
  );

  const tileExited = exitedTiles.length > 0;

  if (tileExited) {
    if (state.level >= lastLevel) {
      return { ...state, status: "won" };
    }

    return resolveNewLevel({
      state,
      rand,
      exitedTiles,
      level: state.level + 1,
    });
  }

  if (
    state.tiles.some(
      (t) =>
        t.value !== null && t.value >= getGoalFromGridSize(settings.gridSize)
    )
  ) {
    if (state.level >= lastLevel) {
      return { ...state, status: "won" };
    }

    return resolveNewLevel({
      state,
      rand,
      exitedTiles,
      level: state.level + 1,
    });
  }

  const available = getAvailablePositions(state);

  if (available.length === 0) {
    const map = createPositionMap(state.tiles);
    let movesLeft = false;

    outer: for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const tile = map[r]?.[c];
        if (!tile) continue;
        const right = map[r]?.[c + 1];
        const down = map[r + 1]?.[c];
        if (
          (right && right.value === tile.value) ||
          (down && down.value === tile.value)
        ) {
          movesLeft = true;
          break outer;
        }
      }
    }

    if (!movesLeft) {
      return { ...state, status: "lost" };
    }
  }

  return state;
}

function resolveTurn(
  state: Types.GameState,
  changed: boolean
): Types.GameState {
  if (!changed) return state;

  const nextTurn = state.turn + 1;

  return {
    ...state,
    turn: nextTurn,
  };
}

const applyAction: Types.ApplyAction = (props) => {
  if (!props.action) {
    const rand = withRand(props.seed);

    return getInitState({
      rand,
      seed: props.seed,
    });
  }

  const { state, action } = props;

  if (!supportedActions.includes(action)) {
    return state;
  }

  const settings = getLevelSettings(state);

  const rand = withRand(`${state.seed}-${state.level}-${state.turn}`);

  let nextState: Types.GameState = {
    ...state,
  };

  const gridSize: Types.GridSize = settings.gridSize;

  const { tiles, scoreIncrease, changed } = slideTiles(
    nextState.tiles,
    action,
    gridSize
  );

  nextState = {
    ...nextState,
    tiles,
    score: state.score + scoreIncrease,
  };

  const exitResult = applyExitLocations(nextState, gridSize, action);
  const overallChanged = changed || exitResult.changed;

  nextState = spawnRandomTile(nextState, rand, overallChanged);
  nextState = resolveEndState(nextState, rand);
  nextState = resolveTurn(nextState, overallChanged);

  return nextState;
};

const gameConfig: Types.GameConfig = {
  supportedActions,
  name: "2048",
  applyAction,
};

export default gameConfig;
