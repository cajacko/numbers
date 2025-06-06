import * as Types from "@/game/Game.types";

export default function moveTile(
  tile: Types.Tile,
  row: number,
  column: number
): boolean {
  if (tile.position[0] !== row || tile.position[1] !== column) {
    tile.position = [row, column];
    return true;
  }
  return false;
}
