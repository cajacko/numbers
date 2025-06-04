import * as Types from "@/game/Game.types";
import getLevelSettings from "@/game/utils/getLevelSettings";

export default function getIsAvailablePosition(
  state: Types.GameState,
  position: Types.Position
): boolean {
  const [row, column] = position;
  const gridSize = getLevelSettings(state).gridSize;

  // Check if the position is within the grid bounds
  if (
    row < 0 ||
    row >= gridSize.rows ||
    column < 0 ||
    column >= gridSize.columns
  ) {
    return false;
  }

  // Check if the position is occupied by a tile
  return !state.tiles.some(
    (tile) => tile.position[0] === row && tile.position[1] === column
  );
}
