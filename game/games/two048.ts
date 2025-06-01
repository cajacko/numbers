import * as Types from "@/game/Game.types";
import spawnTile from "@/game/utils/spawnTile";
import createPositionMap from "@/game/utils/createPositionMap";
import getAvailablePositions from "@/game/utils/getAvailablePositions";

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
  gridSize,
  rand,
  count,
  value,
}: {
  state: Types.GameState;
  gridSize: Types.GridSize;
  rand: Types.Rand;
  count: number;
  value: Types.Value;
}): Types.GameState {
  let nextState: Types.GameState | null = state;

  for (let i = 0; i < count; i++) {
    nextState = spawnTile({
      gridSize,
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

const getInitState: Types.GetInitState = ({ rand, gridSize, settings }) => {
  let nextState: Types.GameState = {
    tiles: [],
    score: 0,
    status: "user-turn",
    settings,
    exitLocations: [
      {
        requirements: {
          type: "greater-than-equal-to",
          value: 2,
        },
        side: "bottom",
        index: 2,
      },
      {
        requirements: {
          type: "greater-than-equal-to",
          value: 2,
        },
        side: "left",
        index: 2,
      },
      {
        requirements: {
          type: "greater-than-equal-to",
          value: 2,
        },
        side: "right",
        index: 2,
      },
      {
        requirements: {
          type: "greater-than-equal-to",
          value: 2,
        },
        side: "top",
        index: 2,
      },
    ],
  };

  if (settings.randomFixedTiles) {
    nextState = spawnTiles({
      state: nextState,
      gridSize,
      rand,
      count: settings.randomFixedTiles,
      value: null,
    });
  }

  if (settings.zeroTiles) {
    nextState = spawnTiles({
      state: nextState,
      gridSize,
      rand,
      count: settings.permZeroTileCount,
      value: 0,
    });
  }

  nextState = spawnTiles({
    state: nextState,
    gridSize,
    rand,
    count: 2,
    value: settings.newTileValue,
  });

  return nextState;
};

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

  for (const exit of state.exitLocations) {
    let row: number;
    let col: number;
    let newRow: number;
    let newCol: number;

    switch (exit.side) {
      case "top":
        row = 0;
        col = exit.index;
        newRow = -1;
        newCol = col;
        break;
      case "bottom":
        row = gridSize.rows - 1;
        col = exit.index;
        newRow = gridSize.rows;
        newCol = col;
        break;
      case "left":
        row = exit.index;
        col = 0;
        newRow = row;
        newCol = -1;
        break;
      case "right":
        row = exit.index;
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
      requirementsMet(tile.value, exit.requirements) &&
      actionToExitLocationSide[action] === exit.side
    ) {
      if (moveTile(tile, newRow, newCol)) changed = true;
    }
  }

  return { changed };
}

function spawnRandomTile(
  state: Types.GameState,
  gridSize: Types.GridSize,
  rand: Types.Rand,
  changed: boolean
): Types.GameState {
  if (!changed) return state;

  let nextState = state;

  const zeroCount = state.tiles.filter((t) => t.value === 0).length;

  let value: number | null;

  if (
    nextState.settings.zeroTiles &&
    zeroCount < nextState.settings.permZeroTileCount
  ) {
    value = 0;
  } else {
    value = nextState.settings.newTileValue;
  }

  nextState =
    spawnTile({
      state,
      gridSize,
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

function resolveEndState(
  state: Types.GameState,
  gridSize: Types.GridSize
): Types.GameState {
  const { rows, columns } = gridSize;

  const tileExited = state.tiles.some(
    (t) =>
      t.position[0] < 0 ||
      t.position[0] >= rows ||
      t.position[1] < 0 ||
      t.position[1] >= columns
  );

  if (tileExited) {
    return { ...state, status: "won" };
  }

  if (
    state.tiles.some(
      (t) => t.value !== null && t.value >= getGoalFromGridSize(gridSize)
    )
  ) {
    return { ...state, status: "won" };
  }

  const available = getAvailablePositions({ gridSize, state });
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

const applyAction: Types.ApplyAction = ({ state, action, gridSize, rand }) => {
  if (!supportedActions.includes(action)) {
    return state;
  }

  const { tiles, scoreIncrease, changed } = slideTiles(
    state.tiles,
    action,
    gridSize
  );

  let nextState: Types.GameState = {
    ...state,
    tiles,
    score: state.score + scoreIncrease,
  };

  const exitResult = applyExitLocations(nextState, gridSize, action);
  const overallChanged = changed || exitResult.changed;

  nextState = spawnRandomTile(nextState, gridSize, rand, overallChanged);
  nextState = resolveEndState(nextState, gridSize);

  return nextState;
};

const gameConfig: Types.GameConfig = {
  supportedActions,
  name: "2048",
  getInitState,
  applyAction,
  defaultGridSize: {
    rows: 4,
    columns: 4,
  },
  defaultSettings: {
    zeroTiles: false,
    permZeroTileCount: 2,
    randomFixedTiles: 0,
    newTileValue: 1,
  },
};

export default gameConfig;
