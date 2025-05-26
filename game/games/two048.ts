import * as Types from "@/game/Game.types";
import spawnTile from "@/game/utils/spawnTile";
import createPositionMap from "@/game/utils/createPositionMap";
import getAvailablePositions from "@/game/utils/getAvailablePositions";

export function getColorsFromValue(value: number): {
  backgroundColor: string;
  textColor: string;
} {
  switch (value) {
    case 2:
      return { backgroundColor: "#eee4da", textColor: "#776e65" };
    case 4:
      return { backgroundColor: "#ede0c8", textColor: "#776e65" };
    case 8:
      return { backgroundColor: "#f2b179", textColor: "#f9f6f2" };
    case 16:
      return { backgroundColor: "#f59563", textColor: "#f9f6f2" };
    case 32:
      return { backgroundColor: "#f67c5f", textColor: "#f9f6f2" };
    case 64:
      return { backgroundColor: "#f65e3b", textColor: "#f9f6f2" };
    case 128:
      return { backgroundColor: "#edcf72", textColor: "#f9f6f2" };
    case 256:
      return { backgroundColor: "#edcc61", textColor: "#f9f6f2" };
    case 512:
      return { backgroundColor: "#edc850", textColor: "#f9f6f2" };
    case 1024:
      return { backgroundColor: "#edc53d", textColor: "#f9f6f2" };
    case 2048:
      return { backgroundColor: "#edc22e", textColor: "#f9f6f2" };
    default:
      return { backgroundColor: "#cdc1b4", textColor: "#776e65" };
  }
}

const getInitState: Types.GetInitState = ({ rand, gridSize }) => {
  let state: Types.GameState | null = {
    tiles: [],
    score: 0,
    state: "playing",
  };

  state = spawnTile({
    gridSize,
    rand,
    state,
    tile: {
      value: 2,
      ...getColorsFromValue(2),
    },
  });

  if (!state) {
    throw new Error("No available position to place a new tile.");
  }

  state = spawnTile({
    gridSize,
    rand,
    state,
    tile: {
      value: 2,
      ...getColorsFromValue(2),
    },
  });

  if (!state) {
    throw new Error("No available position to place a new tile.");
  }

  return state;
};

function slideTiles(
  tiles: Types.Tile[],
  direction: Types.Direction,
  gridSize: Types.GridSize
) {
  const working: Types.Tile[] = tiles.map((t) => ({ ...t, mergedFrom: null }));
  const positionMap = createPositionMap(working);
  const removed = new Set<Types.TileId>();
  let scoreIncrease = 0;
  let changed = false;

  const merge = (target: Types.Tile, source: Types.Tile) => {
    removed.add(source.id);
    target.value *= 2;
    const colors = getColorsFromValue(target.value);
    target.backgroundColor = colors.backgroundColor;
    target.textColor = colors.textColor;
    target.mergedFrom = [target.id, source.id];
    scoreIncrease += target.value;
    if (
      source.position[0] !== target.position[0] ||
      source.position[1] !== target.position[1]
    ) {
      changed = true;
    }
  };

  const move = (tile: Types.Tile, row: number, column: number) => {
    if (tile.position[0] !== row || tile.position[1] !== column) {
      changed = true;
      tile.position = [row, column];
    }
  };

  const { rows, columns } = gridSize;

  if (direction === "up" || direction === "down") {
    for (let col = 0; col < columns; col++) {
      const columnTiles: Types.Tile[] = [];
      const rIter = direction === "up" ? [0, rows, 1] : [rows - 1, -1, -1];
      for (let r = rIter[0]; r !== rIter[1]; r += rIter[2]) {
        const tile = positionMap[r]?.[col];
        if (tile) columnTiles.push(tile);
      }

      let targetRow = direction === "up" ? 0 : rows - 1;
      let lastTile: Types.Tile | null = null;

      columnTiles.forEach((tile) => {
        if (lastTile && lastTile.value === tile.value && !lastTile.mergedFrom) {
          merge(lastTile, tile);
        } else {
          move(tile, targetRow, col);
          lastTile = tile;
          targetRow += direction === "up" ? 1 : -1;
        }
      });
    }
  } else {
    for (let row = 0; row < rows; row++) {
      const rowTiles: Types.Tile[] = [];
      const cIter =
        direction === "left" ? [0, columns, 1] : [columns - 1, -1, -1];
      for (let c = cIter[0]; c !== cIter[1]; c += cIter[2]) {
        const tile = positionMap[row]?.[c];
        if (tile) rowTiles.push(tile);
      }

      let targetCol = direction === "left" ? 0 : columns - 1;
      let lastTile: Types.Tile | null = null;

      rowTiles.forEach((tile) => {
        if (lastTile && lastTile.value === tile.value && !lastTile.mergedFrom) {
          merge(lastTile, tile);
        } else {
          move(tile, row, targetCol);
          lastTile = tile;
          targetCol += direction === "left" ? 1 : -1;
        }
      });
    }
  }

  const newTiles = working.filter((t) => !removed.has(t.id));
  return { tiles: newTiles, scoreIncrease, changed };
}

function spawnRandomTile(
  state: Types.GameState,
  gridSize: Types.GridSize,
  rand: Types.Rand,
  changed: boolean
): Types.GameState {
  if (!changed) return state;

  const value = rand() < 0.9 ? 2 : 4;

  const spawned = spawnTile({
    state,
    gridSize,
    rand,
    tile: { value, ...getColorsFromValue(value) },
  });

  return spawned ?? state;
}

function resolveEndState(
  state: Types.GameState,
  gridSize: Types.GridSize
): Types.GameState {
  const { rows, columns } = gridSize;

  if (state.tiles.some((t) => t.value >= 2048)) {
    return { ...state, state: "won" };
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
      return { ...state, state: "lost" };
    }
  }

  return state;
}

const applyMove: Types.ApplyMove = ({ state, direction, gridSize, rand }) => {
  const { tiles, scoreIncrease, changed } = slideTiles(
    state.tiles,
    direction,
    gridSize
  );

  let nextState: Types.GameState = {
    ...state,
    tiles,
    score: state.score + scoreIncrease,
  };

  nextState = spawnRandomTile(nextState, gridSize, rand, changed);
  nextState = resolveEndState(nextState, gridSize);

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
