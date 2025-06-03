import * as Types from "@/game/Game.types";
import getLevelSettings from "./getLevelSettings";
import getAvailablePositions from "./getAvailablePositions";
import createPositionMap from "./createPositionMap";
import getGoalFromGridSize from "./getGoalFromGridSize";
import resolveNewLevel from "./resolveNewLevel";

export default function resolveEndState(
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
      (t) => t.value !== null && t.value >= getGoalFromGridSize(settings.gridSize)
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
