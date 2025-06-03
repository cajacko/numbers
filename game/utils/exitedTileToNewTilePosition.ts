import * as Types from "@/game/Game.types";

export default function exitedTileToNewTilePosition(
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
