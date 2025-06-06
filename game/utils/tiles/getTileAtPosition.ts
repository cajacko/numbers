import * as Types from "@/game/Game.types";

export default function getTileAtPosition(
  tiles: Types.Tile[],
  position: Types.Position
): Types.Tile | null {
  return (
    tiles.find(
      (tile) =>
        tile.position[0] === position[0] && tile.position[1] === position[1]
    ) || null
  );
}
