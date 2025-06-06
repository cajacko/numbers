import * as Types from "@/game/Game.types";

export default function editTile(
  tileId: Types.TileId,
  tile: Types.Tile,
  state: Types.GameState
): Types.GameState {
  const newTiles = state.tiles.map((t) =>
    t.id === tileId ? { ...t, ...tile } : t
  );

  return {
    ...state,
    tiles: newTiles,
  };
}
