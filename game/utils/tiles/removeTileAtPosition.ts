import * as Types from "@/game/Game.types";

export default function removeTileAtPosition(
  state: Types.GameState,
  position: Types.Position
): Types.GameState {
  const newTiles = state.tiles.filter(
    (t) => t.position[0] !== position[0] || t.position[1] !== position[1]
  );

  return {
    ...state,
    tiles: newTiles,
  };
}
