import * as Types from "@/game/Game.types";
import createPositionMap from "./positions/createPositionMap";
import slideColumn from "./slideColumn";
import slideRow from "./slideRow";

export default function slideTiles(
  tiles: Types.Tile[],
  action: Types.RegularActionType,
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
