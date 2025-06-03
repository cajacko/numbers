import * as Types from "@/game/Game.types";
import getColorsFromValue from "./getColorsFromValue";

export default function mergeTiles(
  target: Types.Tile,
  source: Types.Tile,
  removed: Set<Types.TileId>
): { score: number | null; changed: boolean } {
  // Fixed tiles (value === null) should never merge. Guard against it here.
  if (target.value === null || source.value === null) {
    return { score: null, changed: false };
  }

  removed.add(source.id);

  target.value += source.value;

  const colors = getColorsFromValue(target.value);
  target.backgroundColor = colors.backgroundColor;
  target.textColor = colors.textColor;
  target.mergedFrom = [target.id, source.id];

  const changed =
    source.position[0] !== target.position[0] ||
    source.position[1] !== target.position[1];

  return { score: target.value, changed };
}
