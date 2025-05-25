import * as Types from "@/game/Game.types";

export default function createTileMap(
  tiles: Types.Tile[]
): Record<Types.TileId, Types.Tile> {
  const map: Record<Types.TileId, Types.Tile> = {};

  for (const tile of tiles) {
    map[tile.id] = tile;
  }

  return map;
}
