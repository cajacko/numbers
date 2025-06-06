import * as Types from "@/game/Game.types";
import moveTile from "./moveTile";
import requirementsMet from "./requirementsMet";
import getLevelSettings from "./getLevelSettings";

const actionToExitLocationSide: Record<
  Types.RegularActionType,
  Types.ExitLocation["side"] | null
> = {
  up: "top",
  down: "bottom",
  left: "left",
  right: "right",
  tap: null,
  tick: null,
};

export default function applyExitLocations(
  state: Types.GameState,
  gridSize: Types.GridSize,
  action: Types.RegularActionType
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
