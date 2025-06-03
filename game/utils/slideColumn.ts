import * as Types from "@/game/Game.types";
import mergeTiles from "./mergeTiles";
import moveTile from "./moveTile";

export default function slideColumn(
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
