import * as Types from "@/game/Game.types";

export default function createTileMap(tiles: Types.Tile[]): {
  [row: number]: { [column: number]: Types.Tile };
} {
  const map: { [row: number]: { [column: number]: Types.Tile } } = {};

  for (const tile of tiles) {
    const [row, column] = tile.position;

    if (!map[row]) {
      map[row] = {};
    }

    map[row][column] = tile;
  }

  return map;
}
