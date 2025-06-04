import * as Types from "../../Game.types";
import getLevelSettings from "@/game/utils/getLevelSettings";
import setOverlayTiles from "@/game/utils/setOverlayTiles";
import getSnakedPriorityArr from "@/game/utils/spawning/getRightToLeftPriorityArr";

function getHasSpawnPriorityOverlays(state: Types.GameState): boolean {
  // Check if there are any overlay tiles with spawn priority icons
  return state.overlayTiles.some((tile) =>
    tile.icons.some((icon) => icon.type === "spawn-priority")
  );
}

/**
 * Throw if we can't find spawn priority 1, we should have checked this already
 */
function getSpawnPriorityFirstPosition(state: Types.GameState): Types.Position {
  // Find the first position with a spawn priority overlay
  const overlay = state.overlayTiles.find((tile) =>
    tile.icons.some(
      (icon) => icon.type === "spawn-priority" && icon.value === 1
    )
  );

  if (overlay) {
    return overlay.position;
  }

  // If no overlay found, return the first tile position
  throw new Error("No spawn priority overlay found");
}

function getPriorityArrFromGridSize(gridSize: Types.GridSize): number[] {
  const positions: number[] = [];
  let priority = 1;

  for (let row = 0; row < gridSize.rows; row++) {
    for (let column = 0; column < gridSize.columns; column++) {
      positions.push(priority);

      priority += 1;
    }
  }

  return positions;
}

function getShiftedPosition(
  firstPosition: Types.Position,
  shiftBy: number,
  gridSize: Types.GridSize
): Types.Position {
  const totalTiles = gridSize.rows * gridSize.columns;
  const firstIndex = firstPosition[0] * gridSize.columns + firstPosition[1];
  const shiftedIndex = (firstIndex + shiftBy) % totalTiles;

  return [
    Math.floor(shiftedIndex / gridSize.columns),
    shiftedIndex % gridSize.columns,
  ];
}

export default function resolveSpawnPriorities(
  state: Types.GameState,
  rand: Types.Rand
): Types.GameState {
  const levelSettings = getLevelSettings(state);
  const spawnTilesMethod = levelSettings.spawnTilesMethod;

  if (!spawnTilesMethod || spawnTilesMethod.type === "random") {
    // No spawn tiles method defined, nothing to resolve
    return state;
  }

  const hasSpawnPriorityOverlays = getHasSpawnPriorityOverlays(state);
  const priorityArr = getPriorityArrFromGridSize(levelSettings.gridSize);

  let sortedPriorityArr: number[];

  if (spawnTilesMethod.type === "rtl-sequence") {
    const shiftBy = spawnTilesMethod.shiftBy;
    let levelInitPosition = spawnTilesMethod.levelInitPosition ?? [0, 0];

    if (hasSpawnPriorityOverlays) {
      // If we have overlays, we need to resolve the snake sequence based on the first position
      const firstPosition = getSpawnPriorityFirstPosition(state);

      const shiftedPosition = getShiftedPosition(
        firstPosition,
        shiftBy,
        levelSettings.gridSize
      );

      levelInitPosition = shiftedPosition;
    }

    sortedPriorityArr = getSnakedPriorityArr(
      levelSettings.gridSize,
      levelInitPosition
    );
  } else if (spawnTilesMethod.type === "fixed-random") {
    if (hasSpawnPriorityOverlays) return state;

    sortedPriorityArr = priorityArr.sort(() => rand(priorityArr) - 0.5);
  } else {
    // never
    throw new Error(`Unknown spawn tiles method type`);
  }

  return setOverlayTiles(
    state,
    (position, overlayTile, i): Types.OverlayTile => {
      const newOverlayTile: Types.OverlayTile = {
        ...overlayTile,
        icons: [
          { type: "spawn-priority", value: sortedPriorityArr[i] },
          ...overlayTile.icons.filter(({ type }) => type !== "spawn-priority"),
        ],
      };

      return newOverlayTile;
    }
  );
}
